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
  const rateSwap = converter.toT(props.exchange.offeredRate, 18, 3);

  return (
    <div className={addPrefixClass("widget-exchange")}>
      <div className={addPrefixClass("widget-exchange__body")}>
        {props.networkError !== "" && (
          <div className={addPrefixClass("network_error")}>
            <span><img src={require("../../../assets/img/warning.svg")} /></span>
            <span>{props.networkError}</span>
          </div>
        )}

        {props.exchange.type === 'swap' && (
          <div>
            <div className={addPrefixClass("widget-exchange__title")}>Your are performing token conversion, Please choose</div>
            <div className={addPrefixClass("widget-exchange__swap-container")}>
              <div className={addPrefixClass("widget-exchange__swap-item")}>
                <div className={addPrefixClass("widget-exchange__text theme-text")}>From Token</div>
                <div className={addPrefixClass(`select-token-panel common__input-panel short-margin ${errorExchange ? "error" : ""}`)}>
                  {props.tokenSourceSelect}
                  <div className={addPrefixClass("common__input-panel-label input-container")}>
                    <div>
                      <input
                        min="0" step="0.000001" placeholder="0" autoFocus type="text"
                        maxLength="50" autoComplete="off" value={props.input.sourceAmount.value || ''}
                        onFocus={props.input.sourceAmount.onFocus} onBlur={props.input.sourceAmount.onBlur}
                        onChange={handleChangeSource} className={addPrefixClass("widget-exchange__input")}
                      />
                    </div>
                  </div>
                </div>
                {errorShow}
              </div>

              <div className={addPrefixClass("widget-exchange__swap-button-container")}>
                <span data-tip={props.translate('transaction.click_to_swap') || 'Click to swap'} data-for="swap" currentitem="false">
                  <div className={"widget-exchange__swap-button swap"} onClick={(e) => props.swapToken(e)}/>
                </span>
              </div>

              <div className={addPrefixClass("widget-exchange__swap-item")}>
                <div className={addPrefixClass("widget-exchange__text theme-text")}>To Token</div>
                <div className={addPrefixClass("select-token-panel common__input-panel short-margin")}>
                  {props.tokenDestSelect}
                  <div className={addPrefixClass("common__input-panel-label")}>
                    {props.exchange.isSelectToken ? "Loading..." : `${props.exchange.destAmount} ${props.destTokenSymbol}`}
                  </div>
                </div>
                <div className={addPrefixClass("widget-exchange__swap-text")}>
                  <span>1 {props.sourceTokenSymbol}</span>
                  <span className={addPrefixClass("widget-exchange__approximate")}> ≈ </span>
                  <span>{rateSwap} {props.destTokenSymbol}</span>
                  <span className={addPrefixClass("widget-exchange__approximate")}> ≈ </span>
                  <span>? USD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {props.exchange.type === 'buy' && (
          <div className={addPrefixClass('widget-layout')}>
            {props.exchange.isHaveDestAmount && (
              <div>
                <div className={addPrefixClass("pay-info")}>
                  <div className={addPrefixClass("info-1")}>
                    {props.translate("transaction.you_about_to_buy") || "You are about to buy"}
                  </div>
                  <div className={addPrefixClass("info-2")}>
                    <div className={addPrefixClass("info-2__content")}>
                      <div>{props.translate("transaction.amount") || "Amount"}:</div>
                      <div>{('' + props.exchange.destAmount).length > 8 ? converter.roundingNumber(props.exchange.destAmount) : props.exchange.destAmount} {props.exchange.destTokenSymbol}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className={addPrefixClass("choose-payment")}>
                    <span className={addPrefixClass("transaction-label")}>
                      {props.translate("transaction.exchange_paywith") || "PAY WITH"}
                    </span>
                    <div className={addPrefixClass(errorExchange ? "error select-token-panel" : "select-token-panel")}>
                      {props.tokenSourceSelect}
                      <div className={addPrefixClass("amount-pay")}>
                        <div>{props.translate("transaction.estimate_value_should_pay") || "Estimate value you should pay"}</div>

                        {props.exchange.sourceTokenSymbol !== props.exchange.destTokenSymbol && (
                          <div>{props.exchange.offeredRate == "0" ? 0 : converter.caculateSourceAmount(props.exchange.destAmount, props.exchange.offeredRate, 6)} {props.exchange.sourceTokenSymbol} </div>
                        )}
                        {props.exchange.sourceTokenSymbol === props.exchange.destTokenSymbol && (
                          <div>{('' + props.exchange.destAmount).length > 8 ? converter.roundingNumber(props.exchange.destAmount) : props.exchange.destAmount} {props.exchange.sourceTokenSymbol} </div>
                        )}
                      </div>
                    </div>
                    <div className={addPrefixClass(errorExchange ? "error" : "")}>
                      {errorShow}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!props.exchange.isHaveDestAmount && (
              <div>
                <div>
                  <div className={addPrefixClass("choose-payment")}>
                    <span className={addPrefixClass("transaction-label")}>
                      {props.translate("transaction.exchange_paywith") || "PAY WITH"}
                    </span>
                    <div className={addPrefixClass(errorExchange ? "error select-token-panel" : "select-token-panel")}>
                      {props.tokenSourceSelect}
                      <span className={addPrefixClass("transaction-label amount-enter-label")}>
                        {props.translate("transaction.enter_amount") || "ENTER AMOUNT YOU WILL PAY"}
                      </span>
                      <div>
                        <div>
                          <input
                            id="inputSource"
                            className={addPrefixClass("source-input")}
                            min="0"
                            step="0.000001"
                            placeholder="0" autoFocus
                            type="text" maxLength="50" autoComplete="off"
                            value={props.input.sourceAmount.value}
                            onFocus={props.input.sourceAmount.onFocus}
                            onBlur={props.input.sourceAmount.onBlur}
                            onChange={handleChangeSource}
                          />
                        </div>
                        <div>
                          <span>{props.sourceTokenSymbol}</span>
                        </div>
                      </div>
                    </div>
                    <div className={addPrefixClass(errorExchange ? "error" : "")}>
                      {errorShow}
                    </div>
                  </div>
                  {!props.global.params.receiveToken && (
                    <div className={addPrefixClass("choose-payment")}>
                      <span className={addPrefixClass("transaction-label")}>
                        {props.translate("transaction.exchange_receive_token") || "RECEIVE TOKEN"}
                      </span>
                      <div className={addPrefixClass("select-token-panel")}>
                        {props.tokenDestSelect}
                      </div>
                    </div>
                  )}
                </div>
                {props.exchange.sourceTokenSymbol !== props.exchange.destTokenSymbol && (
                  <div className={addPrefixClass("estimate-dest-value")}>
                    Estimate dest amount: {props.exchange.offeredRate == "0" ? 0 : converter.caculateDestAmount(props.exchange.sourceAmount, props.exchange.offeredRate, 6)} {props.exchange.destTokenSymbol}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {props.exchange.type === 'pay' && (
          <div className={addPrefixClass('widget-exchange__column')}>
            <div className={addPrefixClass("widget-exchange__column-item")}>
              <div className={addPrefixClass("widget-exchange__text theme-text")}>Choose your Token:</div>
              <div className={addPrefixClass("common__input-panel")}>
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
                    <div></div>
                    {(!props.exchange.isSelectToken && !isSourceEqualtoDestToken) && (
                      <div>{props.exchange.offeredRate == "0" ? 0 : converter.caculateSourceAmount(props.exchange.destAmount, props.exchange.offeredRate, 4)}</div>
                    )}
                    {(!props.exchange.isSelectToken && isSourceEqualtoDestToken) && (
                      <div>{('' + props.exchange.destAmount).length > 8 ? converter.roundingNumber(props.exchange.destAmount) : props.exchange.destAmount}</div>
                    )}
                  </div>
                )}
              </div>

              {!props.exchange.isHaveDestAmount && (
                <div className={addPrefixClass("widget-exchange__input-container")}>
                  <div className={addPrefixClass("widget-exchange__text theme-text")}>
                    {props.translate("transaction.enter_amount") || "Enter amount you will pay"}:
                  </div>
                  <div className={addPrefixClass("common__input-panel")}>
                    <input
                      className={addPrefixClass("common__input theme-border")}
                      min="0"
                      step="0.000001"
                      placeholder="0"
                      autoFocus
                      type="text" maxLength="50" autoComplete="off"
                      value={props.input.sourceAmount.value}
                      onFocus={props.input.sourceAmount.onFocus}
                      onBlur={props.input.sourceAmount.onBlur}
                      onChange={handleChangeSource}
                    />
                    <div className={addPrefixClass("common__input-panel-label small")}>{props.sourceTokenSymbol}</div>
                  </div>

                  {!props.global.params.receiveToken && (
                    <div>
                      <div className={addPrefixClass("widget-exchange__text theme-text")}>
                        {props.translate("transaction.exchange_receive_token") || "Receive Token"}
                      </div>
                      <div className={addPrefixClass("common__input-panel")}>
                        {props.tokenDestSelect}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {errorShow}
            </div>

            <div className={addPrefixClass("widget-exchange__column-item")}>
              {props.detailBox}
            </div>
          </div>
        )}
      </div>

      <div className={addPrefixClass("common__flexbox between widget-exchange__bot")}>
        <label className={addPrefixClass("common__checkbox")}>
          <span className={addPrefixClass("common__checkbox-text")}>
            <span>{props.translate("transaction.i_agree_to") || "Agree to"} </span>
            <a className={addPrefixClass("theme-text theme-text-hover")} href="https://files.kyber.network/tac.html" target="_blank" onClick={(e) => {if (props.global.analytics) props.global.analytics.callTrack("clickTermAndCondition")}}>
              {props.translate("transaction.term_and_condition") || "Terms &amp; Conditions"}
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
