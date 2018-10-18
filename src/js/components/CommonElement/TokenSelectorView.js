import React from "react"
import * as converter from "../../utils/converter"
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import {addPrefixClass} from "../../utils/className"
import { default as _ } from "underscore";
import { getTokenUrl } from "../../utils/common";

const TokenSelectorView = (props) => {
  var focusItem = props.listItem[props.focusItem]
  if (!focusItem) {
    focusItem = {}
  }
  //console.log("list_item")
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

  priorityTokens = _.sortBy(priorityTokens, function(token) { return token.index; });

  var getListToken = () => {

    //const destRateEth = props.listItem[props.exchange.destTokenSymbol].rateEth;

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
          // className={"token-item-container " + (rate == 0 ? "token-item-container--inactive" : "payment-gateway__hover-color")}>
          className={addPrefixClass("token-item-container payment-gateway__hover-color")}>
          <div className={addPrefixClass("token-item-content")}>
            <div className={addPrefixClass("token-item")}>
              <img className={addPrefixClass("token-item__icon")} src={getTokenUrl(item.symbol)}/>
              <span className={addPrefixClass("token-item__symbol")}>{item.symbol}</span>
            </div>

            <div className={addPrefixClass("token-item")}>
              <div className={addPrefixClass("token-item__rate")}>
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
  var rateFocusItem
  if (focusItem.symbol){
    rateFocusItem = focusItem.symbol === "ETH" ? "": converter.roundingNumber(converter.toT(props.tokens[focusItem.symbol].rate, 18))
  }else{
    rateFocusItem = 0
  }
  

  return (
    <div className={addPrefixClass("token-chooser")}>
      <Dropdown className={addPrefixClass("token-dropdown")} onShow = {(e) => props.showTokens(e)} onHide = {(e) => props.hideTokens(e)} active={props.open}>
        <DropdownTrigger className={addPrefixClass("notifications-toggle token-dropdown__trigger")}>
          <div className={addPrefixClass("focus-item d-flex")}>
            <div className={addPrefixClass("d-flex")}>
              <div className={addPrefixClass("icon")}>
                {focusItem.symbol && (
                  <img src={getTokenUrl(focusItem.symbol)} />
                )}
              </div>
              <div>
                <div className={addPrefixClass("focus-balance")}>
                  <span className={addPrefixClass("token-symbol")}>{focusItem.symbol}</span>
                </div>
              </div>
            </div>
            {focusItem.symbol !== "ETH" && (              
              <div className="rate-token">
                1 {focusItem.symbol} = {rateFocusItem} ETH
              </div>
            )}
            <div><i className={addPrefixClass('k k-angle ' + (props.open ? 'up' : 'down'))}></i></div>
          </div>
        </DropdownTrigger>
        <DropdownContent className={addPrefixClass("token-dropdown__content")}>
          <div className={addPrefixClass("select-item")}>
            <div className={addPrefixClass("suggest-item")}>
              {priorityTokens.map((token, i) => {
                return (
                  <div className={addPrefixClass("suggest-item__content")} key={i} onClick={(e) => props.selectItem(e, token.symbol, token.address, "suggest")}>
                    <img className={addPrefixClass("suggest-item__icon")} src={getTokenUrl(token.symbol)} />
                    <div className={addPrefixClass("suggest-item__symbol")}>{token.symbol}</div>
                  </div>
                )
              })}
            </div>
            <div className={addPrefixClass("search-item")}>
              <input value={props.searchWord} placeholder='Try "DAI"' onChange={(e) => props.changeWord(e)} type="text" onFocus={(e) => props.analytics.callTrack("searchToken", props.type)}/>
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

}
export default TokenSelectorView
