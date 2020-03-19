import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ConfirmTransactionBase from '../confirm-transaction-base'
import UserPreferencedCurrencyDisplay from '../../components/app/user-preferenced-currency-display'
import {
  formatCurrency,
  convertTokenToFiat,
  addFiat,
  roundExponential,
  convertSmallNumberToRegular
} from '../../helpers/utils/confirm-tx.util'
import { getWeiHexFromDecimalValue } from '../../helpers/utils/conversions.util'
import { ETH, PRIMARY } from '../../helpers/constants/common'

export default class ConfirmTokenTransactionBase extends Component {
  static contextTypes = {
    t: PropTypes.func,
  }

  static propTypes = {
    tokenAddress: PropTypes.string,
    toAddress: PropTypes.string,
    tokenAmount: PropTypes.number,
    tokenSymbol: PropTypes.string,
    fiatTransactionTotal: PropTypes.string,
    ethTransactionTotal: PropTypes.string,
    contractExchangeRate: PropTypes.number,
    conversionRate: PropTypes.number,
    currentCurrency: PropTypes.string,
    tokenIssuer: PropTypes.object
  }

  static defaultProps = {
    tokenAmount: 0,
  }

  getFiatTransactionAmount () {
    const { tokenAmount, currentCurrency, conversionRate, contractExchangeRate } = this.props

    return convertTokenToFiat({
      value: tokenAmount,
      toCurrency: currentCurrency,
      conversionRate,
      contractExchangeRate,
    })
  }

  renderSubtitleComponent () {
    const { contractExchangeRate, tokenAmount } = this.props

    const decimalEthValue = (tokenAmount * contractExchangeRate) || 0
    const hexWeiValue = getWeiHexFromDecimalValue({
      value: decimalEthValue,
      fromCurrency: ETH,
      fromDenomination: ETH,
    })

    return typeof contractExchangeRate === 'undefined'
      ? (
        <span>
          { this.context.t('noConversionRateAvailable') }
        </span>
      ) : (
        <UserPreferencedCurrencyDisplay
          value={hexWeiValue}
          type={PRIMARY}
          showEthLogo
          hideLabel
        />
      )
  }

  renderPrimaryTotalTextOverride () {
    const { tokenAmount, tokenSymbol, ethTransactionTotal, tokenIssuer } = this.props
    const tokensText = `${convertSmallNumberToRegular(tokenAmount)} ${tokenSymbol}`

    return (
      <div>
        {
          !tokenIssuer || (tokenIssuer && !tokenIssuer.feeFund)
            ? <div>
              <span>{ `${tokensText} + ` }</span>
              <img
                src="/images/tomo.svg"
                height="18"
                style={{marginRight: '5px'}}
              />
              <span>{ ethTransactionTotal }</span>
            </div>
            : <span>{`${tokensText}`}</span>
        }
      </div>
    )
  }

  getSecondaryTotalTextOverride () {
    const { fiatTransactionTotal, currentCurrency, contractExchangeRate } = this.props

    if (typeof contractExchangeRate === 'undefined') {
      return formatCurrency(fiatTransactionTotal, currentCurrency)
    } else {
      const fiatTransactionAmount = this.getFiatTransactionAmount()
      const fiatTotal = addFiat(fiatTransactionAmount, fiatTransactionTotal)
      const roundedFiatTotal = roundExponential(fiatTotal)
      return formatCurrency(roundedFiatTotal, currentCurrency)
    }
  }

  render () {
    const {
      toAddress,
      tokenAddress,
      tokenSymbol,
      tokenAmount,
      ...restProps
    } = this.props

    const tokensText = `${convertSmallNumberToRegular(tokenAmount)} ${tokenSymbol}`

    return (
      <ConfirmTransactionBase
        toAddress={toAddress}
        identiconAddress={tokenAddress}
        title={tokensText}
        subtitleComponent={this.renderSubtitleComponent()}
        primaryTotalTextOverride={this.renderPrimaryTotalTextOverride()}
        secondaryTotalTextOverride={this.getSecondaryTotalTextOverride()}
        {...restProps}
      />
    )
  }
}
