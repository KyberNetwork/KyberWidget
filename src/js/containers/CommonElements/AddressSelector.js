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
          className={addPrefixClass("address-selector__item " + (address.addressString === this.props.wallet.address ? 'address-selector__item--active' : ''))}
          onClick={() => this.setWallet(address.index, address.addressString, roundingNumber(address.balance))}>
            <div className={addPrefixClass("address-selector__item-address")}>{address.addressString}</div>
            <div className={addPrefixClass("address-selector__item-balance")}>
              {address.balance == '-1' ?
                <img src={require('../../../assets/img/icons/icon-loading.gif')} />
                : <span>{roundingNumber(address.balance)} ETH</span>
              }
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
            <div className={addPrefixClass("focus-item d-flex theme-border")}>
              <div className={addPrefixClass("focus-item__bold-text")}>{this.props.wallet.address}</div>
              <div className={addPrefixClass("common__arrow")}/>
            </div>
          </DropdownTrigger>
          <DropdownContent>
            <div className={addPrefixClass("select-item theme-border")}>
              <div className={addPrefixClass("list-item custom-scroll")}>
                {this.getAddressList()}
              </div>

              <div className={addPrefixClass(`address-list-navigation ${this.props.isFirstList ? 'disabled' : ''}`)}>
                <div onClick={this.props.getPreAddress} className={addPrefixClass("address-list-navigation__button")}>
                  <div className={addPrefixClass("common__arrow left")}/>
                </div>
                <div onClick={this.props.getMoreAddress} className={addPrefixClass("address-list-navigation__button")}>
                  <div className={addPrefixClass("common__arrow right")}/>
                </div>
              </div>
            </div>
          </DropdownContent>
        </Dropdown>
      </div>
    )
  }
}
