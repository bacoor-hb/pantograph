import { connect } from 'react-redux'
import EstimateGasRow from './estimate-gas-row.component'
import { getEstimateGasError, getTokenIssuer } from '../../send.selectors' 
import { getSelectedToken } from '../../../../selectors/selectors'

function mapStateToProps (state) {
  const estimateGasError = getEstimateGasError(state)
  const tokenIssuer = getTokenIssuer(state)
  const selectedToken = getSelectedToken(state)
  return {
    estimateGasError,
    tokenIssuer,
    selectedToken
  }
}

export default connect(mapStateToProps)(EstimateGasRow)