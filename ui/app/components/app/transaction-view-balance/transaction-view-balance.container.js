import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import TransactionViewBalance from './transaction-view-balance.component'
import {
  getSelectedToken,
  getSelectedAddress,
  getNativeCurrency,
  getSelectedTokenAssetImage,
  getMetaMaskAccounts,
  isBalanceCached,
  preferencesSelector,
  getIsMainnet,
  getContractMetaData
} from '../../../selectors/selectors'
import { showModal } from '../../../store/actions'
import { checksumAddress }from '../../../helpers/utils/util'

const mapStateToProps = state => {
  const { showFiatInTestnets } = preferencesSelector(state)
  const isMainnet = getIsMainnet(state)
  const selectedAddress = getSelectedAddress(state)
  const selectedToken = getSelectedToken(state)
  const { metamask: { network } } = state
  const accounts = getMetaMaskAccounts(state)
  const account = accounts[selectedAddress]
  const { balance } = account
  const tokens = state.metamask.tokens
  const contractMetaData = getContractMetaData(state)
  let assetImage = getSelectedTokenAssetImage(state)
  if (!assetImage && selectedToken) {
    const checksummedAddress = checksumAddress(selectedToken.address)
    assetImage = contractMetaData[checksummedAddress.toLowerCase()] ? contractMetaData[checksummedAddress.toLowerCase()].icon_image : null
    if (!assetImage) {
      let tokenFind = tokens.find(e => e.address.toLowerCase() === checksummedAddress.toLowerCase())
      if (tokenFind && tokenFind.type) {
        assetImage = `images/tokens/${tokenFind.type}.png`
      }
    }
  }

  return {
    selectedToken,
    network,
    balance,
    nativeCurrency: getNativeCurrency(state),
    assetImage,
    balanceIsCached: isBalanceCached(state),
    showFiat: (isMainnet || !!showFiatInTestnets),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    showDepositModal: () => dispatch(showModal({ name: 'DEPOSIT_ETHER' })),
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(TransactionViewBalance)
