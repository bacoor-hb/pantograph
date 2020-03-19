import { connect } from 'react-redux'
import SendContent from './send-content.component'
import {
  accountsWithSendEtherInfoSelector,
  getSendTo,
  getTokenIssuer,
  getConversionRate,
  getGasTotal,
  getSelectedToken
} from '../send.selectors'
import {
  isTokenIssuerBalanceSufficient
} from '../send.utils'
import {
  getAddressBookEntry,
} from '../../../selectors/selectors'
import actions from '../../../store/actions'

function mapStateToProps (state) {
  const ownedAccounts = accountsWithSendEtherInfoSelector(state)
  const selectedTokenAddress = getSelectedToken(state)
  const to = getSendTo(state)
  const gasTotal = getGasTotal(state)
  const conversionRate = getConversionRate(state)
  const tokenIssuer = getTokenIssuer(state)
  const insufficientTokenIssuerBalance = !isTokenIssuerBalanceSufficient({
    amount: '0x0',
    gasTotal,
    balance: tokenIssuer.feeFund,
    conversionRate,
  })
  return {
    isOwnedAccount: !!ownedAccounts.find(({ address }) => address.toLowerCase() === to.toLowerCase()),
    contact: getAddressBookEntry(state, to),
    to,
    tokenIssuer,
    selectedTokenAddress,
    insufficientTokenIssuerBalance,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showAddToAddressBookModal: (recipient) => dispatch(actions.showModal({
      name: 'ADD_TO_ADDRESSBOOK',
      recipient,
    })),
  }
}

function mergeProps (stateProps, dispatchProps, ownProps) {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    showAddToAddressBookModal: () => dispatchProps.showAddToAddressBookModal(stateProps.to),
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(SendContent)
