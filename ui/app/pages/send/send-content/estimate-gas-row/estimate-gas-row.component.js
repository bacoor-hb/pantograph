import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SendRowWrapper from '../send-row-wrapper'

export default class EstimateGasRow extends Component {
  static propTypes = {
    estimateGasError: PropTypes.string,
    tokenIssuer: PropTypes.object,
    selectedToken: PropTypes.object,
  }
  static contextTypes = {
    t: PropTypes.func
  }
  render () {
    const { estimateGasError, tokenIssuer, selectedToken } = this.props
    return (
      <SendRowWrapper
        label={''}
        showError={false}
        errorType="estimateGas"
      >
        <div className="send-v2__estimate-gas-error">
          {
            estimateGasError
              ? selectedToken && selectedToken.address && tokenIssuer && tokenIssuer.feeFund ? this.context.t('transmissionFeeRequires', [selectedToken.symbol]) : null
              : null
          }
        </div>
      </SendRowWrapper>
    )
  }
}