const ObservableStore = require('obs-store')
const SafeEventEmitter = require('safe-event-emitter')
const createAsyncMiddleware = require('json-rpc-engine/src/createAsyncMiddleware')
const { errors: rpcErrors } = require('eth-json-rpc-errors')

/**
 * A controller that services user-approved requests for a full Ethereum provider API
 */
class ProviderApprovalController extends SafeEventEmitter {
  /**
   * Creates a ProviderApprovalController
   *
   * @param {Object} [config] - Options to configure controller
   */
  constructor ({ closePopup, initState, keyringController, openPopup, preferencesController } = {}) {
    super()
    this.closePopup = closePopup
    this.keyringController = keyringController
    this.openPopup = openPopup
    this.preferencesController = preferencesController
    this.memStore = new ObservableStore({
      providerRequests: [],
    })

    const defaultState = { approvedOrigins: {} }
    this.store = new ObservableStore(Object.assign(defaultState, initState))
  }

  /**
   * Called when a user approves access to a full Ethereum provider API
   *
   * @param {object} opts - opts for the middleware contains the origin for the middleware
   */
  createMiddleware ({ senderUrl, extensionId, getSiteMetadata }) {
    return createAsyncMiddleware(async (req, res, next) => {
      // only handle requestAccounts
      if (req.method !== 'eth_requestAccounts') return next()
      // if already approved or privacy mode disabled, return early
      const isUnlocked = this.keyringController.memStore.getState().isUnlocked
      const origin = senderUrl.hostname
      if (this.shouldExposeAccounts(origin) && isUnlocked) {
        res.result = [this.preferencesController.getSelectedAddress()]
        return
      }
      // register the provider request
      const metadata = { hostname: senderUrl.hostname, origin }
      if (extensionId) {
        metadata.extensionId = extensionId
      } else {
        const siteMetadata = await getSiteMetadata(origin)
        Object.assign(metadata, { siteTitle: siteMetadata.name, siteImage: siteMetadata.icon})
      }
      this._handleProviderRequest(metadata)
      // wait for resolution of request
      const approved = await new Promise(resolve => this.once(`resolvedRequest:${origin}`, ({ approved }) => resolve(approved)))
      if (approved) {
        res.result = [this.preferencesController.getSelectedAddress()]
      } else {
        throw rpcErrors.eth.userRejectedRequest('User denied account authorization')
      }
    })
  }

  /**
  * @typedef {Object} SiteMetadata
  * @param {string} hostname - The hostname of the site
  * @param {string} origin - The origin of the site
  * @param {string} [siteTitle] - The title of the site
  * @param {string} [siteImage] - The icon for the site
  * @param {string} [extensionId] - The extension ID of the extension
  */
  /**
   * Called when a tab requests access to a full Ethereum provider API
   *
   * @param {SiteMetadata} siteMetadata - The metadata for the site requesting full provider access
   */
  _handleProviderRequest (siteMetadata) {
    const { providerRequests } = this.memStore.getState()
    const origin = siteMetadata.origin
    this.memStore.updateState({
      providerRequests: [
        ...providerRequests,
        siteMetadata,
      ],
    })
    const isUnlocked = this.keyringController.memStore.getState().isUnlocked
    const { approvedOrigins } = this.store.getState()
    const originAlreadyHandled = approvedOrigins[origin]
    if (originAlreadyHandled && isUnlocked) {
      return
    }
    this.openPopup && this.openPopup()
  }

  /**
   * Called when a user approves access to a full Ethereum provider API
   *
   * @param {string} origin - origin of the domain that had provider access approved
   */
  approveProviderRequestByOrigin (origin) {
    if (this.closePopup) {
      this.closePopup()
    }

    const { approvedOrigins } = this.store.getState()
    const { providerRequests } = this.memStore.getState()
    const providerRequest = providerRequests.find((request) => request.origin === origin)
    const remainingProviderRequests = providerRequests.filter(request => request.origin !== origin)
    this.store.updateState({
      approvedOrigins: {
        ...approvedOrigins,
        [origin]: {
          siteTitle: providerRequest ? providerRequest.siteTitle : null,
          siteImage: providerRequest ? providerRequest.siteImage : null,
          hostname: providerRequest ? providerRequest.hostname : null,
        },
      },
    })
    this.memStore.updateState({ providerRequests: remainingProviderRequests })
    this.emit(`resolvedRequest:${origin}`, { approved: true })
  }

  /**
   * Called when a tab rejects access to a full Ethereum provider API
   *
   * @param {string} origin - origin of the domain that had provider access approved
   */
  rejectProviderRequestByOrigin (origin) {
    if (this.closePopup) {
      this.closePopup()
    }

    const { approvedOrigins } = this.store.getState()
    const { providerRequests } = this.memStore.getState()
    const remainingProviderRequests = providerRequests.filter(request => request.origin !== origin)

    // We're cloning and deleting keys here because we don't want to keep unneeded keys
    const _approvedOrigins = Object.assign({}, approvedOrigins)
    delete _approvedOrigins[origin]

    this.store.putState({ approvedOrigins: _approvedOrigins })
    this.memStore.putState({ providerRequests: remainingProviderRequests })
    this.emit(`resolvedRequest:${origin}`, { approved: false })
  }

  /**
   * Clears any approvals for user-approved origins
   */
  clearApprovedOrigins () {
    this.store.updateState({
      approvedOrigins: {},
    })
  }

  /**
   * Determines if a given origin should have accounts exposed
   *
   * @param {string} origin - Domain origin to check for approval status
   * @returns {boolean} - True if the origin has been approved
   */
  shouldExposeAccounts (origin) {
    return Boolean(this.store.getState().approvedOrigins[origin])
  }

  /**
   * Returns a merged state representation
   * @return {object}
   * @private
   */
  _getMergedState () {
    return Object.assign({}, this.memStore.getState(), this.store.getState())
  }
}

module.exports = ProviderApprovalController
