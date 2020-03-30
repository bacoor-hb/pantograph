import React, { Component } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'
import SendRowWrapper from '../send-row-wrapper'
import AmountMaxButton from './amount-max-button'
import UserPreferencedCurrencyInput from '../../../../components/app/user-preferenced-currency-input'
import UserPreferencedTokenInput from '../../../../components/app/user-preferenced-token-input'
import { isTokenBalanceSufficient } from '../../send.utils'

export default class SendAmountRow extends Component {

  static propTypes = {
    amount: PropTypes.string,
    amountConversionRate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    balance: PropTypes.string,
    conversionRate: PropTypes.number,
    convertedCurrency: PropTypes.string,
    gasTotal: PropTypes.string,
    inError: PropTypes.bool,
    primaryCurrency: PropTypes.string,
    selectedToken: PropTypes.object,
    setMaxModeTo: PropTypes.func,
    tokenBalance: PropTypes.string,
    updateGasFeeError: PropTypes.func,
    updateSendAmount: PropTypes.func,
    updateSendAmountError: PropTypes.func,
    updateGas: PropTypes.func,
    tokenIssuer: PropTypes.object
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  componentDidUpdate (prevProps) {
    const { maxModeOn: prevMaxModeOn, gasTotal: prevGasTotal } = prevProps
    const { maxModeOn, amount, gasTotal, selectedToken } = this.props

    if (maxModeOn && selectedToken && !prevMaxModeOn) {
      this.updateGas(amount)
    }

    if (prevGasTotal !== gasTotal) {
      // this.validateAmount(amount)
    }
  }

  updateGas = debounce(this.updateGas.bind(this), 500)

  validateAmount (amount) {
    const {
      amountConversionRate,
      balance,
      conversionRate,
      gasTotal,
      primaryCurrency,
      selectedToken,
      tokenBalance,
      updateGasFeeError,
      updateSendAmountError,
      tokenIssuer
    } = this.props

    updateSendAmountError({
      amount,
      amountConversionRate,
      balance,
      conversionRate,
      gasTotal,
      primaryCurrency,
      selectedToken,
      tokenBalance,
    })

    if (selectedToken) {
      updateGasFeeError({
        amountConversionRate,
        balance,
        conversionRate,
        gasTotal,
        primaryCurrency,
        selectedToken,
        tokenBalance,
        tokenIssuer
      })
    }
  }

  updateAmount (amount) {
    const { updateSendAmount, setMaxModeTo } = this.props

    setMaxModeTo(false)
    updateSendAmount(amount)
  }

  updateGas (amount) {
    const { selectedToken, updateGas, tokenBalance } = this.props
    let inSufficientTokens = false
    if (selectedToken && tokenBalance !== null) {
      const { decimals } = selectedToken
      inSufficientTokens = !isTokenBalanceSufficient({
        tokenBalance,
        amount,
        decimals,
      })
    }
    if (selectedToken && !inSufficientTokens) {
      updateGas({ amount })
    }
  }

  renderInput () {
    const { amount, inError, selectedToken } = this.props
    const Component = selectedToken ? UserPreferencedTokenInput : UserPreferencedCurrencyInput

    return (
      <Component
        onChange={newAmount => {
          this.validateAmount(newAmount)
          this.updateGas(newAmount)
          this.updateAmount(newAmount)
        }}
        error={inError}
        value={amount}
      />
    )
  }

  render () {
    const { gasTotal, inError, updateGas } = this.props

    return (
      <SendRowWrapper
        label={`${this.context.t('amount')}:`}
        showError={inError}
        errorType="amount"
      >
        {gasTotal && <AmountMaxButton inError={inError} updateGas={updateGas} />}
        { this.renderInput() }
      </SendRowWrapper>
    )
  }

}
