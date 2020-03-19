function prefixForNetwork (network) {
  const net = parseInt(network)
  let prefix
  switch (net) {
    case 88: // main net
      prefix = 'wallet.'
      break
    case 89: // test net
      prefix = 'apiwallet.testnet.'
      break
    default:
      prefix = ''
  }
  return prefix
}

module.exports = prefixForNetwork