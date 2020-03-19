function prefixForNetwork (network) {
  const net = parseInt(network)
  let prefix
  switch (net) {
    case 88: // main net
      prefix = ''
      break
    case 89: // test net
      prefix = 'testnet.'
      break
    default:
      prefix = ''
  }
  return prefix
}

module.exports = prefixForNetwork