import PropTypes from 'prop-types'
import React, {PureComponent} from 'react'
import Identicon from '../../../ui/identicon'

export default class ProviderPageContainerContent extends PureComponent {
  static propTypes = {
    origin: PropTypes.string.isRequired,
    selectedIdentity: PropTypes.object.isRequired,
    siteImage: PropTypes.string,
    siteTitle: PropTypes.string,
    hostname: PropTypes.string,
    extensionId: PropTypes.string,
  }

  static contextTypes = {
    t: PropTypes.func,
  };

  renderConnectVisual = (title, identifier) => {
    const { selectedIdentity, siteImage } = this.props

    return (
      <div className="provider-approval-visual">
        <section>
          {siteImage ? (
            <img
              className="provider-approval-visual__identicon"
              src={siteImage}
            />
          ) : (
            <i className="provider-approval-visual__identicon--default">
              {title.charAt(0).toUpperCase()}
            </i>
          )}
          <h1>{title}</h1>
          <h2>{identifier}</h2>
        </section>
        <span className="provider-approval-visual__check" />
        <section>
          <Identicon
            className="provider-approval-visual__identicon"
            address={selectedIdentity.address}
            diameter={64}
          />
          <h1>{selectedIdentity.name}</h1>
        </section>
      </div>
    )
  }

  render () {
    const { siteTitle, hostname, extensionId } = this.props
    const { t } = this.context

    const title = extensionId ?
      'External Extension' :
      siteTitle || hostname

    const identifier = extensionId ?
      `Extension ID: '${extensionId}'` :
      hostname

    return (
      <div className="provider-approval-container__content">
        <section>
          <h2>{t('connectRequest')}</h2>
          {this.renderConnectVisual(title, identifier)}
          <h1>{t('providerRequest', [title])}</h1>
          <p>
            {t('providerRequestInfo')}
            <br/>
            <a
              href="https://pantograph.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('learnMore')}.
            </a>
          </p>
        </section>
      </div>
    )
  }
}
