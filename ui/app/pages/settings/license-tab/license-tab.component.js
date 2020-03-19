import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

export default class LicenseTab extends PureComponent {

  static contextTypes = {
    t: PropTypes.func,
  }

  render () {
    const { t } = this.context

    return (
      <div className="settings-page__body">
        <div className="settings-page__content-row">
          <p>MIT License Copyright (c) 2018 MetaMask</p>
        </div>
      </div>
    )
  }
}
