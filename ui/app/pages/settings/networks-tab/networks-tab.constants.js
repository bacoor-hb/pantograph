const defaultNetworksData = [
  {
    labelKey: 'tomo_mainnet',
    iconColor: '#ff9c2a',
    providerType: 'ropsten',
    rpcUrl: 'https://rpc.tomochain.com',
    chainId: '88',
    ticker: 'TOMO',
    blockExplorerUrl: 'https://scan.tomochain.com/',
  },
  {
    labelKey: 'tomo_testnet',
    iconColor: '#3099f2',
    providerType: 'tomo_testnet',
    rpcUrl: 'https://rpc.testnet.tomochain.com',
    chainId: '89',
    ticker: 'TOMO',
    blockExplorerUrl: 'https://scan.testnet.tomochain.com/',
  }
]

export {
  defaultNetworksData,
}
