/*global Web3*/


// need to make sure we aren't affected by overlapping namespaces
// and that we dont affect the app with our namespace
// mostly a fix for web3's BigNumber if AMD's "define" is defined...
let __define

/**
 * Caches reference to global define object and deletes it to
 * avoid conflicts with other global define objects, such as
 * AMD's define function
 */
const cleanContextForImports = () => {
  __define = global.define
  try {
    global.define = undefined
  } catch (_) {
    console.warn('Pantograph - global.define could not be deleted.')
  }
}

/**
 * Restores global define object from cached reference
 */
const restoreContextAfterImports = () => {
  try {
    global.define = __define
  } catch (_) {
    console.warn('Pantograph - global.define could not be overwritten.')
  }
}

cleanContextForImports()
require('web3/dist/web3.min.js')
const log = require('loglevel')
const LocalMessageDuplexStream = require('post-message-stream')
const setupDappAutoReload = require('./lib/auto-reload.js')
const MetamaskInpageProvider = require('metamask-inpage-provider')
const createStandardProvider = require('./createStandardProvider').default

let warned = false

restoreContextAfterImports()

log.setDefaultLevel(process.env.METAMASK_DEBUG ? 'debug' : 'warn')

//
// setup plugin communication
//

// setup background connection
const metamaskStream = new LocalMessageDuplexStream({
  name: 'pantograph-inpage',
  target: 'pantograph-contentscript',
})

// compose the inpage provider
const inpageProvider = new MetamaskInpageProvider(metamaskStream)

// set a high max listener count to avoid unnecesary warnings
inpageProvider.setMaxListeners(100)

let warnedOfAutoRefreshDeprecation = false
// augment the provider with its enable method
inpageProvider.enable = function ({ force } = {}) {
  if (
    !warnedOfAutoRefreshDeprecation &&
    inpageProvider.autoRefreshOnNetworkChange
  ) {
    console.warn(`MetaMask: MetaMask will soon stop reloading pages on network change.
If you rely upon this behavior, add a 'networkChanged' event handler to trigger the reload manually: https://metamask.github.io/metamask-docs/API_Reference/Ethereum_Provider#ethereum.on(eventname%2C-callback)
Set 'ethereum.autoRefreshOnNetworkChange' to 'false' to silence this warning: https://metamask.github.io/metamask-docs/API_Reference/Ethereum_Provider#ethereum.autorefreshonnetworkchange'
`)
    warnedOfAutoRefreshDeprecation = true
  }
  return new Promise((resolve, reject) => {
    inpageProvider.sendAsync({ method: 'eth_requestAccounts', params: [force] }, (error, response) => {
      if (error || response.error) {
        reject(error || response.error)
      } else {
        resolve(response.result)
      }
    })
  })
}

// give the dapps control of a refresh they can toggle this off on the window.ethereum
// this will be default true so it does not break any old apps.
inpageProvider.autoRefreshOnNetworkChange = true


// publicConfig isn't populated until we get a message from background.
// Using this getter will ensure the state is available
const getPublicConfigWhenReady = async () => {
  const store = inpageProvider.publicConfigStore
  let state = store.getState()
  // if state is missing, wait for first update
  if (!state.networkVersion) {
    state = await new Promise(resolve => store.once('update', resolve))
    console.log('new state', state)
  }
  return state
}

// add metamask-specific convenience methods
inpageProvider._metamask = new Proxy({
  /**
   * Synchronously determines if this domain is currently enabled, with a potential false negative if called to soon
   *
   * @returns {boolean} - returns true if this domain is currently enabled
   */
  isEnabled: function () {
    const { isEnabled } = inpageProvider.publicConfigStore.getState()
    return Boolean(isEnabled)
  },

  /**
   * Asynchronously determines if this domain is currently enabled
   *
   * @returns {Promise<boolean>} - Promise resolving to true if this domain is currently enabled
   */
  isApproved: async function () {
    const { isEnabled } = await getPublicConfigWhenReady()
    return Boolean(isEnabled)
  },

  /**
   * Determines if MetaMask is unlocked by the user
   *
   * @returns {Promise<boolean>} - Promise resolving to true if MetaMask is currently unlocked
   */
  isUnlocked: async function () {
    const { isUnlocked } = await getPublicConfigWhenReady()
    return Boolean(isUnlocked)
  },
}, {
  get: function (obj, prop) {
    !warned && console.warn('Heads up! ethereum._metamask exposes methods that have ' +
    'not been standardized yet. This means that these methods may not be implemented ' +
    'in other dapp browsers and may be removed from MetaMask in the future.')
    warned = true
    return obj[prop]
  },
})

// Work around for web3@1.0 deleting the bound `sendAsync` but not the unbound
// `sendAsync` method on the prototype, causing `this` reference issues
const proxiedInpageProvider = new Proxy(inpageProvider, {
  // straight up lie that we deleted the property so that it doesnt
  // throw an error in strict mode
  deleteProperty: () => true,
})

window.tomochain = createStandardProvider(proxiedInpageProvider)

//
// setup web3
//

if (typeof window.tomoWeb3 !== 'undefined') {
  throw new Error(`Pantograph detected another web3.
    Pantograph will not work reliably with another web3 extension.
     This usually happens if you have two Pantograph installed,
     or Pantograph and another web3 extension. Please remove one
     and try again.`)
}

const tomoWeb3 = new Web3(proxiedInpageProvider)
tomoWeb3.setProvider = function () {
  log.debug('Pantograph - overrode web3.setProvider')
}
log.debug('Pantograph - injected web3')

setupDappAutoReload(tomoWeb3, inpageProvider.publicConfigStore)

// set web3 defaultAccount
inpageProvider.publicConfigStore.subscribe(function (state) {
  tomoWeb3.eth.defaultAccount = state.selectedAddress
})

inpageProvider.publicConfigStore.subscribe(function (state) {
  if (state.onboardingcomplete) {
    window.postMessage('onboardingcomplete', '*')
  }
})
