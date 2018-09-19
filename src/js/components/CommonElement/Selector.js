import React from "react"
//import { toT, roundingNumber } from "../../utils/converter"
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import {addPrefixClass} from "../../utils/className"

const Selector = (props) => {
  var focusItem = props.listItem[props.focusItem]
  var listShow = {}
  
  Object.keys(props.listItem).map((key, i) => {
    var token = props.listItem[key],
      matchName = token.name.toLowerCase().includes(props.searchWord),
      matchSymbol = token.symbol.toLowerCase().includes(props.searchWord)
    if (matchSymbol || matchName) {
      listShow[key] = props.listItem[key]
    }
  })

  var getListToken = () => {
    return Object.keys(listShow).map((key, i) => {
      if (key !== props.focusItem) {
        var item = listShow[key]
        var balance = toT(item.balance, item.decimal)
        return (
          <div key={key} onClick={(e) => props.selectItem(e, item.symbol, item.address)} className="token-item">
            <div>
              <span className="item-icon">
                <img src={require("../../../assets/img/tokens/" + item.icon)} />
              </span>
              <span className="item-name">
                <span className="font-w-b">{item.symbol}</span><span className="show-for-large token-name"> - {item.name}</span></span>
              {item.isNotSupport &&
                <span className="unsupported">{props.translate("error.not_supported") || "not supported"}</span>
              }
            </div>
            <div>
              <span title={balance}>{roundingNumber(balance)}</span>
            </div>
          </div>
        )
      }
    })
  }

  return (
    <div className={addPrefixClass("token-selector")}>
      <Dropdown onShow = {(e) => props.showTokens(e)} onHide = {(e) => props.hideTokens(e)}>
        <DropdownTrigger className={addPrefixClass("notifications-toggle")}>
          <div className={addPrefixClass("focus-item d-flex")}>
            <div>
              <div className={addPrefixClass("icon")}>
                <img src={require("../../../assets/img/tokens/" + focusItem.icon)} />
              </div>
              <div>
                <div>{focusItem.name}</div>
                <div>
                  <span className={addPrefixClass("token-balance")} title = {toT(focusItem.balance)}>{roundingNumber(toT(focusItem.balance, focusItem.decimal))}</span>
                  <span className={addPrefixClass("token-symbol")}>{focusItem.symbol}</span>
                </div>
              </div>
            </div>
            <div><i className={addPrefixClass('k k-angle white ' + (props.open ? 'up' : 'down'))}></i></div>
          </div>
        </DropdownTrigger>
        <DropdownContent>
          <div className={addPrefixClass("select-item")}>
            <div className={addPrefixClass("search-item")}>
              <input value={props.searchWord} placeholder={props.translate("search") || "Search"} onChange={(e) => props.changeWord(e)} type="text"/>
            </div>
            <div className={addPrefixClass("list-item custom-scroll")}>
              {getListToken()}
            </div>
          </div>
        </DropdownContent>
      </Dropdown>
    </div>
  )

}
export default Selector