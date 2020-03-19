import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { toDataUrl } from '../../../../lib/blockies'
import contractMap from 'eth-contract-metadata'
import { checksumAddress } from '../../../helpers/utils/util'
import Jazzicon from '../jazzicon'

const getStyles = (diameter, wDiameter) => (
  {
    height: diameter,
    width: wDiameter || diameter,
    borderRadius: 3,
  }
)

export default class Identicon extends PureComponent {
  static propTypes = {
    addBorder: PropTypes.bool,
    address: PropTypes.string,
    className: PropTypes.string,
    diameter: PropTypes.number,
    wDiameter: PropTypes.number,
    image: PropTypes.string,
    useBlockie: PropTypes.bool,
  }

  static defaultProps = {
    diameter: 50,
    wDiameter: 50,
  }

  renderImage () {
    const { className, diameter, wDiameter, image } = this.props

    return (
      <img
        className={classnames('identicon', className, diameter === wDiameter && 'rectangle')}
        src={image}
        style={getStyles(diameter, wDiameter)}
      />
    )
  }

  renderJazzicon () {
    const { address, className, diameter, wDiameter } = this.props

    return (
      <Jazzicon
        address={address}
        diameter={diameter}
        wDiameter={wDiameter}
        className={classnames('identicon', className, diameter === wDiameter && 'rectangle')}
        style={getStyles(diameter, wDiameter)}
      />
    )
  }

  renderBlockie () {
    const { address, className, diameter, wDiameter } = this.props

    return (
      <div
        className={classnames('identicon', className, diameter === wDiameter && 'rectangle')}
        style={getStyles(diameter, wDiameter)}
      >
        <img
          src={toDataUrl(address)}
          height={diameter}
          width={wDiameter}
        />
      </div>
    )
  }

  render () {
    const { className, address, image, diameter, wDiameter, useBlockie, addBorder } = this.props

    if (image) {
      return this.renderImage()
    }

    if (address) {
      const checksummedAddress = checksumAddress(address)

      if (contractMap[checksummedAddress] && contractMap[checksummedAddress].logo) {
        return this.renderJazzicon()
      }

      return (
        <div className={classnames({ 'identicon__address-wrapper': addBorder })}>
          { useBlockie ? this.renderBlockie() : this.renderJazzicon() }
        </div>
      )
    }

    return (
      <img
        className={classnames('balance-icon', className)}
        src="./images/tomo.svg"
        style={getStyles(diameter, wDiameter)}
      />
    )
  }
}
