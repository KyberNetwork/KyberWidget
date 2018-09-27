import React from "react"
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import { roundingNumber } from "../../utils/converter";
import { addPrefixClass } from "../../utils/className";

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

  setWallet(index, address, balance) {
    this.hideSelector();
    this.props.setWallet(index, address, balance, this.props.walletType);
  }

  getAddressList = () => {
    return (this.props.addresses).map((address, index) => {
      return (
        <div
          key={index}
          className={addPrefixClass("address-selector__item payment-gateway__checkmark-after " + (address.addressString === this.props.wallet.address ? 'address-selector__item--active' : ''))}
          onClick={() => this.setWallet(address.index, address.addressString, roundingNumber(address.balance))}>
            <div className={addPrefixClass("address-selector__item-address")}>
              {address.addressString.slice(0, 20)}...{address.addressString.slice(-6)}
            </div>
            <div className={addPrefixClass("address-selector__item-balance")}>
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
      <div className={addPrefixClass("token-selector")}>
        <Dropdown onShow={() => this.showSelector()} onHide={() => this.hideSelector()} active={this.state.isOpen}>
          <DropdownTrigger className={addPrefixClass("notifications-toggle")}>
            <div className={addPrefixClass("focus-item d-flex")}>
              <div>{this.props.wallet.address}</div>
              <div><div className={addPrefixClass("payment-gateway__arrow-down")}></div></div>
            </div>
          </DropdownTrigger>
          <DropdownContent>
            <div className={addPrefixClass("select-item")}>
              <div className={addPrefixClass("list-item custom-scroll")}>
                {this.getAddressList()}
              </div>

              <div className={addPrefixClass("address-list-navigation")}>
                  <img
                    src={require('../../../assets/img/import-account/arrows_left_icon.svg')}
                    className={addPrefixClass("payment-gateway__background " + (this.props.isFirstList ? 'disabled' : ''))}
                    onClick={this.props.getPreAddress}/>
                  <img
                    className={addPrefixClass("payment-gateway__background")}
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
