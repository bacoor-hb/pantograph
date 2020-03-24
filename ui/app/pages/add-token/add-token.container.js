import { connect } from 'react-redux'
import AddToken from './add-token.component'

const { setPendingTokens, clearPendingTokens } = require('../../store/actions')

const mapStateToProps = ({ metamask }) => {
  const { identities, tokens, pendingTokens, contractMetaData } = metamask
  return {
    identities,
    tokens,
    pendingTokens,
    contractMetaData
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setPendingTokens: tokens => dispatch(setPendingTokens(tokens)),
    clearPendingTokens: () => dispatch(clearPendingTokens()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddToken)
