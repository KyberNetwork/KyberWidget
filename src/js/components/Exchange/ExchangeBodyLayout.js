import React from "react";
import { filterInputNumber } from "../../utils/validators";
import * as converter from "../../utils/converter";
import {addPrefixClass} from "../../utils/className";
import { TokenSelector } from "../../containers/Exchange";

const ExchangeBodyLayout = (props) => {
  function handleChangeSource(e) {
    var check = filterInputNumber(e, e.target.value, props.input.sourceAmount.value)
    if (check) props.input.sourceAmount.onChange(e)
  }

  var errorSource = []
  var errorExchange = false

  Object.keys(props.exchange.errors).map(key => {
    if (props.exchange.errors[key] && props.exchange.errors[key] !== "") {
      errorSource.push(props.translate(props.exchange.errors[key]) || props.exchange.errors[key])
      errorExchange = true
    }
  })

  var errorShow = errorSource.map((value, index) => {
    return <div className={addPrefixClass("common__error")} key={index}>{value}</div>
  })

  const isSourceEqualtoDestToken = props.exchange.sourceTokenSymbol === props.exchange.destTokenSymbol;
  const rateSwap = isSourceEqualtoDestToken ? 1 : converter.toT(props.exchange.offeredRate, 18, 6);

  return (
    <div className={addPrefixClass("widget-exchange")}>
      <div className={addPrefixClass("widget-exchange__body")}>
        {props.networkError !== "" && (
          <div className={addPrefixClass("network_error")}>
            <span><img src={require("../../../assets/img/warning.svg")} /></span>
            <span>{props.networkError}</span>
          </div>
        )}

        {!props.exchange.type && (
          <div className={addPrefixClass("widget-exchange__loading")}/>
        )}

        {props.exchange.type === 'swap' && (
          <div className={addPrefixClass("widget-exchange__wrapper")}>
            <div className={addPrefixClass("widget-exchange__title")}>Your are performing token conversion, Please choose</div>
            <div className={addPrefixClass("widget-exchange__swap-container")}>
              <div className={addPrefixClass("widget-exchange__swap-item")}>
                <div className={addPrefixClass("widget-exchange__text theme-text")}>From Token</div>
                <div className={addPrefixClass(`common__input-panel short-margin ${errorExchange ? "error" : ""}`)}>
                  {props.tokenSourceSelect}
                  <div className={addPrefixClass("common__input-panel-label input-container")}>
                    <div>
                      <input
                        min="0" step="0.000001" placeholder="0" autoFocus type="text"
                        maxLength="12" autoComplete="off" value={props.input.sourceAmount.value || ''}
                        onFocus={props.input.sourceAmount.onFocus} onBlur={props.input.sourceAmount.onBlur}
                        onChange={handleChangeSource} className={addPrefixClass("widget-exchange__input")}
                      />
                    </div>
                  </div>
                </div>
                {errorShow}
              </div>

              <div className={addPrefixClass("widget-exchange__swap-button-container")}>
                <div className={addPrefixClass("widget-exchange__swap-button swap")} onClick={(e) => props.swapToken(e)}/>
              </div>

              <div className={addPrefixClass("widget-exchange__swap-item")}>
                <div className={addPrefixClass("widget-exchange__text theme-text")}>To Token</div>
                <div className={addPrefixClass("common__input-panel short-margin")}>
                  {props.tokenDestSelect}
                  <div className={addPrefixClass("common__input-panel-label")}>
                    {props.exchange.isSelectToken ? "Loading..." : `${props.exchange.destAmount} ${props.destTokenSymbol}`}
                  </div>
                </div>
                <div className={addPrefixClass("widget-exchange__swap-text")}>
                  <span>1 {props.sourceTokenSymbol}</span>
                  <span className={addPrefixClass("widget-exchange__approximate")}> ≈ </span>
                  <span>{rateSwap} {props.destTokenSymbol}</span>
                  {props.sourceToken && (
                    <span>
                      <span className={addPrefixClass("widget-exchange__approximate")}> ≈ </span>
                      <span>{converter.roundingNumber(props.sourceToken.rateUSD)} USD</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {props.exchange.type === 'buy' && (
          <div className={addPrefixClass("widget-exchange__wrapper")}>
            <div className={addPrefixClass("widget-exchange__title")}>
              Your are buying {props.global.params.receiveAmount} {props.exchange.destTokenSymbol}, Please select your token for the payment
            </div>
            <div className={addPrefixClass("widget-exchange__swap-container")}>
              <div className={addPrefixClass("widget-exchange__swap-item")}>
                <div className={addPrefixClass("widget-exchange__text theme-text")}>From Token</div>
                <div className={addPrefixClass(`common__input-panel short-margin ${errorExchange ? "error" : ""}`)}>
                  {props.tokenSourceSelect}

                  {props.exchange.isHaveDestAmount && (
                    <div className={addPrefixClass("common__input-panel-label")}>
                      {props.exchange.sourceTokenSymbol !== props.exchange.destTokenSymbol && (
                        <div>{props.exchange.offeredRate == "0" ? 0 : props.exchange.isSelectToken ? "Loading..." : converter.caculateSourceAmount(props.exchange.destAmount, props.exchange.offeredRate, 6)}</div>
                      )}
                      {props.exchange.sourceTokenSymbol === props.exchange.destTokenSymbol && (
                        <div>{('' + props.exchange.destAmount).length > 8 ? converter.roundingNumber(props.exchange.destAmount) : props.exchange.destAmount}</div>
                      )}
                    </div>
                  )}

                  {!props.exchange.isHaveDestAmount && (
                    <div className={addPrefixClass("common__input-panel-label input-container")}>
                      <input
                        id="inputSource" className={addPrefixClass("widget-exchange__input")} min="0" step="0.000001" placeholder="0"
                        autoFocus type="text" maxLength="12" autoComplete="off" value={props.input.sourceAmount.value}
                        onFocus={props.input.sourceAmount.onFocus} onBlur={props.input.sourceAmount.onBlur} onChange={handleChangeSource}
                      />
                    </div>
                  )}
                </div>
                {errorShow}
              </div>

              <div className={addPrefixClass("widget-exchange__swap-button-container")}>
                <div className={addPrefixClass("widget-exchange__swap-button buy")}/>
              </div>

              <div className={addPrefixClass("widget-exchange__swap-item disabled")}>
                <div className={addPrefixClass("widget-exchange__text theme-text")}>To Token</div>
                <div className={addPrefixClass("common__input-panel short-margin")}>
                  {props.tokenDestSelect}
                  <div className={addPrefixClass("common__input-panel-label")}>
                    {('' + props.exchange.destAmount).length > 8 ? converter.roundingNumber(props.exchange.destAmount) : props.exchange.destAmount}
                  </div>
                </div>
                <div className={addPrefixClass("widget-exchange__swap-text")}>
                  <span>1 {props.sourceTokenSymbol}</span>
                  <span className={addPrefixClass("widget-exchange__approximate")}> ≈ </span>
                  <span>{rateSwap} {props.destTokenSymbol}</span>
                  {props.sourceToken && (
                    <span>
                      <span className={addPrefixClass("widget-exchange__approximate")}> ≈ </span>
                      <span>{converter.roundingNumber(props.sourceToken.rateUSD)} USD</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {props.exchange.type === 'pay' && (
          <div className={addPrefixClass("widget-exchange__wrapper")}>
            <div className={addPrefixClass('widget-exchange__column')}>
              <div className={addPrefixClass("widget-exchange__column-item")}>
                <div className={addPrefixClass("widget-exchange__text theme-text")}>Choose your Token:</div>
                <div className={addPrefixClass(`common__input-panel ${errorExchange ? 'error' : ''}`)}>
                  <TokenSelector
                    type="source"
                    focusItem={props.exchange.sourceTokenSymbol}
                    listItem={props.tokens}
                    chooseToken={props.onChooseToken}
                  />

                  {props.exchange.isHaveDestAmount && (
                    <div className={addPrefixClass("common__input-panel-label")}>
                      {props.exchange.isSelectToken && (
                        <div>Loading...</div>
                      )}
                      {(!props.exchange.isSelectToken && !isSourceEqualtoDestToken) && (
                        <div>{props.exchange.offeredRate == "0" ? 0 : converter.caculateSourceAmount(props.exchange.destAmount, props.exchange.offeredRate, 6)}</div>
                      )}
                      {(!props.exchange.isSelectToken && isSourceEqualtoDestToken) && (
                        <div>{('' + props.exchange.destAmount).length > 8 ? converter.roundingNumber(props.exchange.destAmount) : props.exchange.destAmount}</div>
                      )}
                    </div>
                  )}

                  {!props.exchange.isHaveDestAmount && (
                    <div className={addPrefixClass("common__input-panel-label input-container")}>
                      <input
                        className={addPrefixClass("common__input theme-border")}
                        min="0"
                        step="0.000001"
                        placeholder="0"
                        autoFocus
                        type="text"
                        maxLength="12"
                        autoComplete="off"
                        value={props.input.sourceAmount.value}
                        onFocus={props.input.sourceAmount.onFocus}
                        onBlur={props.input.sourceAmount.onBlur}
                        onChange={handleChangeSource}
                      />
                    </div>
                  )}
                </div>

                {(!props.exchange.isHaveDestAmount && !props.global.params.receiveToken) && (
                  <div className={addPrefixClass("widget-exchange__input-container")}>
                    <div className={addPrefixClass("common__margin-top")}>
                      <div className={addPrefixClass("widget-exchange__text theme-text")}>
                        {props.translate("transaction.exchange_receive_token") || "Receive Token"}
                      </div>
                      <div className={addPrefixClass(`common__input-panel ${errorExchange ? 'error' : ''}`)}>
                        {props.tokenDestSelect}
                      </div>
                    </div>
                  </div>
                )}

                {errorShow}
              </div>

              <div className={addPrefixClass("widget-exchange__column-item")}>
                {props.detailBox}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={addPrefixClass("common__flexbox between widget-exchange__bot")}>
        <label className={addPrefixClass("common__checkbox")}>
          <span className={addPrefixClass("common__checkbox-text")}>
            <span>{props.translate("transaction.i_agree_to") || "Agree to"} </span>
            <a className={addPrefixClass("theme-text theme-text-hover")} href="https://files.kyber.network/tac.html" target="_blank" onClick={(e) => {if (props.global.analytics) props.global.analytics.callTrack("clickTermAndCondition")}}>
              {props.translate("transaction.term_and_condition") || "Terms & Conditions"}
            </a>
          </span>
          <input id="term-agree" className={addPrefixClass("common__checkbox-input theme-checkbox")} type="checkbox" onChange={props.acceptedTerm}/>
          <span className={addPrefixClass("common__checkbox-icon")}/>
        </label>

        <div className={addPrefixClass(`common__button theme-gradient ${props.isStepValid === false ? "disabled" : ""}`)} onClick={(e) => props.importAccount(e)}>
          {props.translate("transaction.next") || "Next"}
        </div>
      </div>
    </div>
  )
}

export default ExchangeBodyLayout
