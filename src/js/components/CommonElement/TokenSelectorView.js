import React from "react"
import * as converter from "../../utils/converter"
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

const TokenSelectorView = (props) => {
  var focusItem = props.listItem[props.focusItem]
  var listShow = {};
  let priorityTokens = [];

  Object.keys(props.listItem).map((key) => {
    var token = props.listItem[key],
        matchName = token.name.toLowerCase().includes(props.searchWord),
        matchSymbol = token.symbol.toLowerCase().includes(props.searchWord);

    if (matchSymbol || matchName) {
      listShow[key] = props.listItem[key];
    }

    if (token.priority) {
      priorityTokens.push(token);
    }
  });

  var getListToken = () => {
   // const destRateEth = 1

    return Object.keys(listShow).map((key) => {
      if (key === "ETH"){
        return
      }
      if (key === props.focusItem) {
        return;
      }

      var item = listShow[key];
      const sourceRate = item.symbol === "ETH" ? 1 : converter.toT(item.rate, 18);
      //const destRate = converter.toT(destRateEth, 18);
      const rate = converter.roundingNumber(sourceRate);

      return (
        <div
          key={key}
          onClick={(e) => props.selectItem(e, item.symbol, item.address)}
          className={"token-item-container " + (rate == 0 ? "token-item-container--inactive" : "payment-gateway__hover-color")}>
          <div className="token-item-content">
            <div className="token-item">
              <img className="token-item__icon" src={require("../../../assets/img/tokens/" + item.icon)}/>
              <span className="token-item__symbol">{item.symbol}</span>
            </div>

            <div className="token-item">
              <div className="token-item__rate">
                {rate != 0 &&
                  <div>1 {item.symbol} = {rate} ETH</div>
                }

                {rate == 0 &&
                  <div>{props.translate('error.maintenance') || 'Maintenance'}</div>
                }
              </div>
            </div>
          </div>
        </div>
      )
    })
  }


  //var rateFocusItem = converter.roundingNumber(converter.toT(props.tokens.offeredRate,18))
  var rateFocusItem = focusItem.symbol === "ETH" ? "": converter.roundingNumber(converter.toT(props.tokens[focusItem.symbol].rate, 18))
  

  return (
    <div className="token-chooser">
      <Dropdown onShow = {(e) => props.showTokens(e)} onHide = {(e) => props.hideTokens(e)} active={props.open}>
        <DropdownTrigger className="notifications-toggle">
          <div className="focus-item d-flex">
            <div className="d-flex">
              <div className="icon">
                <img src={require("../../../assets/img/tokens/" + focusItem.icon)} />
              </div>
              <div>
                <div className="focus-balance">
                  {props.account !== false && (
                    <span className="token-balance" title = {converter.toT(focusItem.balance)}>{converter.roundingNumber(converter.toT(focusItem.balance, focusItem.decimal))}</span>
                  )}
                  <span className="token-symbol">{focusItem.symbol}</span>
                </div>
              </div>
            </div>
            {focusItem.symbol !== "ETH" && (              
              <div className="rate-token">
                1 {focusItem.symbol} = {rateFocusItem} ETH
              </div>
            )}
            <div><i className={'k k-angle ' + (props.open ? 'up' : 'down')}></i></div>
          </div>
        </DropdownTrigger>
        <DropdownContent>
          <div className="select-item">
            <div className="suggest-item">
              {priorityTokens.map((token, i) => {
                return (
                  <div className="suggest-item__content" key={i} onClick={(e) => props.selectItem(e, token.symbol, token.address)}>
                    <img className="suggest-item__icon" src={require(`../../../assets/img/tokens/${token.icon}`)} />
                    <div className="suggest-item__symbol">{token.symbol}</div>
                  </div>
                )
              })}
            </div>
            <div className="search-item">
              <input value={props.searchWord} placeholder='Try "DAI"' onChange={(e) => props.changeWord(e)} type="text"/>
            </div>
            <div className="list-item">
              <div className="list-item__content">
                {getListToken()}
              </div>
            </div>
          </div>
        </DropdownContent>
      </Dropdown>
    </div>
  )

}
export default TokenSelectorView
