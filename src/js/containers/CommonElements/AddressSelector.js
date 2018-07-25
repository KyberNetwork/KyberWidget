import React from "react"
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import { getTranslate } from 'react-localize-redux';
import { roundingNumber } from "../../utils/converter"

export default class AddressSelector extends React.Component {
  state = {
    isOpen: false,
  }

  showSelector = () => {
    this.setState({ isOpen: true })
  }

  hideSelector = () => {
    this.setState({ isOpen: false })
  }

  setAddress(address, index) {
    this.hideSelector();
    this.props.setAddress(address, index);
  }

  getAddressList = () => {
    return (this.props.addresses).map((address, index) => {
      return (
        <div
          key={index}
          className={'address-selector__item payment-gateway__checkmark-after ' + (address.addressString === this.props.currentAddress ? 'address-selector__item--active' : '')}
          onClick={() => this.setAddress(address.addressString, address.index)}>
            <div className={"address-selector__item-address"}>{address.addressString}</div>
            <div className={"address-selector__item-balance"}>
              {address.balance == '-1' ?
                <img src={require('../../../assets/img/waiting-white.svg')} />
                : roundingNumber(address.balance)
              } ETH
            </div>
        </div>
      )
    })
  }

  render() {
    return (
      <div className="token-selector">
        <Dropdown onShow={() => this.showSelector()} onHide={() => this.hideSelector()} active={this.state.isOpen}>
          <DropdownTrigger className="notifications-toggle">
            <div className="focus-item d-flex">
              <div>{this.props.currentAddress}</div>
              <div><div className={"payment-gateway__arrow-down"}></div></div>
            </div>
          </DropdownTrigger>
          <DropdownContent>
            <div className="select-item">
              <div className="list-item custom-scroll">
                {this.getAddressList()}
              </div>

              <div className="address-list-navigation">
                  <img
                    src={require('../../../assets/img/import-account/arrows_left_icon.svg')}
                    className={"payment-gateway__background " + (this.props.isFirstList ? 'disabled' : '')}
                    onClick={this.props.getPreAddress}/>
                  <img
                    className={"payment-gateway__background"}
                    src={require('../../../assets/img/import-account/arrows_right_icon.svg')}
                    onClick={this.props.getMoreAddress}/>
              </div>
            </div>
          </DropdownContent>
        </Dropdown>
      </div>
    )
  }
}
