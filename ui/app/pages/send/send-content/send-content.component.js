import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PageContainerContent from '../../../components/ui/page-container/page-container-content.component'
import SendAmountRow from './send-amount-row'
import SendGasRow from './send-gas-row'
import SendHexDataRow from './send-hex-data-row'
import SendAssetRow from './send-asset-row'
import EstimateGasRow from './estimate-gas-row'
import Dialog from '../../../components/ui/dialog'

export default class SendContent extends Component {

  static contextTypes = {
    t: PropTypes.func,
  }

  static propTypes = {
    updateGas: PropTypes.func,
    scanQrCode: PropTypes.func,
    showAddToAddressBookModal: PropTypes.func,
    showHexData: PropTypes.bool,
    ownedAccounts: PropTypes.array,
    addressBook: PropTypes.array,
    contact: PropTypes.object,
    isOwnedAccount: PropTypes.bool,
    tokenIssuer: PropTypes.object,
    selectedTokenAddress: PropTypes.object
  }

  updateGas = (updateData) => this.props.updateGas(updateData)

  render () {
    const {  tokenIssuer, selectedTokenAddress } = this.props
    return (
      <PageContainerContent>
        <div className="send-v2__form">
          { this.maybeRenderAddContact() }
          <SendAssetRow />
          <SendAmountRow updateGas={this.updateGas} />
          {(!selectedTokenAddress || !tokenIssuer || (tokenIssuer && !tokenIssuer.feeFund)) && <SendGasRow />}
          <EstimateGasRow />
          {
            this.props.showHexData && (
              <SendHexDataRow
                updateGas={this.updateGas}
              />
            )
          }
        </div>
      </PageContainerContent>
    )
  }

  maybeRenderAddContact () {
    const { t } = this.context
    const { isOwnedAccount, showAddToAddressBookModal, contact = {} } = this.props

    if (isOwnedAccount || contact.name) {
      return
    }

    return (
      <Dialog
        type="message"
        className="send__dialog"
        onClick={showAddToAddressBookModal}
      >
        {t('newAccountDetectedDialogMessage')}
      </Dialog>
    )
  }
}
