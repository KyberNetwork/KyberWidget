import React from "react"
import Dropdown, { DropdownTrigger, DropdownContent } from "react-simple-dropdown";
import {addPrefixClass} from "../../utils/className"
import { default as _ } from "underscore";
import { getTokenUrl } from "../../utils/common";
import * as constants from "../../services/constants";

const TokenSelectorView = (props) => {
  const focusItem = props.listItem[props.focusItem]
  let sortedTokens = {};
  let priorityTokens = [];

  Object.keys(props.listItem).map((key) => {
    const token = props.listItem[key],
        matchName = token.name.toLowerCase().includes(props.searchWord),
        matchSymbol = token.symbol.toLowerCase().includes(props.searchWord);

    if (matchSymbol || matchName) {
      sortedTokens[key] = props.listItem[key];
    }

    if (token.priority) {
      priorityTokens.push(token);
    }
  });

  function getListToken() {
    sortedTokens = _(sortedTokens).chain().sortBy(function (token) {
      return !constants.STABLE_COINS.includes(token.symbol)
    }).sortBy(function (token) {
      return token.index
    }).value();

    return Object.keys(sortedTokens).map((key) => {
      if (key === props.focusItem) {
        return;
      }

      const item = sortedTokens[key];

      return (
        <div className={addPrefixClass("token-item-container theme-text-hover")} onClick={(e) => props.selectItem(e, item.symbol, item.address)} key={key}>
          <div className={addPrefixClass("token-item-content")}>
            <div className={addPrefixClass("token-item")}>
              <span className={addPrefixClass("token-item__symbol")}>{item.symbol}</span>
              <span className={addPrefixClass("token-item__name")}>
                {constants.STABLE_COINS.includes(item.symbol) ? props.translate('exchange.stable_coin') || 'Stable Coin' : item.name}
              </span>
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className={addPrefixClass("token-chooser")}>
      <Dropdown className={addPrefixClass("token-dropdown")} onShow = {(e) => props.showTokens(e)} onHide = {(e) => props.hideTokens(e)} active={props.open}>
        <DropdownTrigger className={addPrefixClass("notifications-toggle token-dropdown__trigger")}>
          <div className={addPrefixClass("token-chooser__selector theme-border")}>
            <img className={addPrefixClass("token-chooser__token-icon")} src={getTokenUrl(focusItem.symbol)} />
            <div className={addPrefixClass("token-chooser__token-symbol")}>{focusItem.symbol}</div>
            <div className={addPrefixClass('common__triangle theme-border-top ' + (props.open ? 'up' : ''))}/>
          </div>
        </DropdownTrigger>
        <DropdownContent className={addPrefixClass("token-dropdown__content")}>
          <div className={addPrefixClass("select-item")}>
            <div className={addPrefixClass("search-item")}>
              <input value={props.searchWord} placeholder='Search' onChange={(e) => props.changeWord(e)} type="text" onFocus={(e) => props.analytics.callTrack("searchToken", props.type)}/>
            </div>
            <div className={addPrefixClass("list-item")}>
              <div className={addPrefixClass("list-item__content")}>
                {getListToken()}
              </div>
            </div>
          </div>
        </DropdownContent>
      </Dropdown>
    </div>
  )
};

export default TokenSelectorView
