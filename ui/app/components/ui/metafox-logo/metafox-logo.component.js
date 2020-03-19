import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

export default class MetaFoxLogo extends PureComponent {
  static propTypes = {
    onClick: PropTypes.func,
    unsetIconHeight: PropTypes.bool,
  }

  render () {
    const iconProps = this.props.unsetIconHeight ? {} : { height: 42, width: 42 }

    return (
      <div
        onClick={this.props.onClick}
        className="app-header__logo-container"
      >
        <img
          height={30}
          src="/images/logoText.svg"
          className="app-header__metafox-logo app-header__metafox-logo--horizontal"
        />
        <img
          {...iconProps}
          src="/images/logoPantograph.svg"
          className="app-header__metafox-logo app-header__metafox-logo--icon"
        />
      </div>
    )
  }
}
