import React from "react"
import { filterInputNumber } from "../../utils/validators";
import * as converter from "../../utils/converter"
import {addPrefixClass} from "../../utils/className"

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
    return <span className={addPrefixClass("error-text")} key={index}>{value}</span>
  })

  var classSource = "amount-input"
  if (props.focus === "source") {
    classSource += " focus"
  }
  if (errorExchange) {
    classSource += " error"
  }

  var haveProductName = props.exchange.productName && props.exchange.productName !== "" ? true : false
  var haveProductAvatar = props.exchange.productAvatar && props.exchange.productAvatar !== "" ? true : false

  return (
    <div id="exchange" className={addPrefixClass("widget-exchange")}>
      <div>
        <div className={addPrefixClass("swap-wrapper")}>
          <div className={addPrefixClass("exchange-col")}>
            <div className={addPrefixClass("exchange-col-1")}>

              <div className={addPrefixClass("exchange-pading exchange-pading-top")}>
                {props.networkError !== "" && (
                  <div className={addPrefixClass("network_error")}>
                    <span>
                      <img src={require("../../../assets/img/warning.svg")} />
                    </span>
                    <span>
                      {props.networkError}
                    </span>
                  </div>
                )}

                {props.exchange.type === 'swap' && (
                  <div className={addPrefixClass('swap-layout'+(errorExchange ? " error" : ""))}>
                    <div className={addPrefixClass('swap-item swap-item-first')}>
                      {/* <span class="transaction-label">FROM</span> */}
                      <div className={addPrefixClass("select-token-panel")}>
                        {props.tokenSourceSelect}
                        {!props.exchange.isHaveDestAmount && (
                          <div className={addPrefixClass(classSource)}>
                            <div>                              
                              <input id="inputSource" className={addPrefixClass("source-input")} min="0" step="0.000001"
                                placeholder="0" autoFocus
                                type="text" maxLength="50" autoComplete="off"
                                value={props.input.sourceAmount.value || ''}
                                onFocus={props.input.sourceAmount.onFocus}
                                onBlur={props.input.sourceAmount.onBlur}
                                onChange={handleChangeSource}
                              />
                            </div>
                          </div>
                        )}
                        {props.exchange.isHaveDestAmount && (
                            <div className={addPrefixClass('dest-amount amount-input')}>
                              <div>Estimate source amount:</div>
                              <div>
                                <strong>{props.exchange.sourceAmount} {props.exchange.sourceTokenSymbol}</strong>
                              </div>
                            </div>
                        )}

                      </div>
                      <div className={addPrefixClass(errorExchange ? "error" : "")}>
                        {errorShow}
                      </div>
                    </div>
                    {!props.global.params.receiveToken && (
                      <div className={addPrefixClass("cell large-2 exchange-icon")}>
                        <span data-tip={props.translate('transaction.click_to_swap') || 'Click to swap'} data-for="swap" currentitem="false">
                          <img src={require("../../../assets/img/arrow_swap.svg")} onClick={(e) => props.swapToken(e)}/>
                        </span>
                      </div>
                    )}
                    
                      <div className={addPrefixClass('swap-item')}>
                        <div className={addPrefixClass("select-token-panel")}>

                          {props.tokenDestSelect}

                          <div className={addPrefixClass('dest-amount amount-input')}>
                            {props.exchange.isHaveDestAmount && (
                              <div>
                                Receive Amount:
                              </div>  
                            )}
                            {!props.exchange.isHaveDestAmount && (
                              <div>
                                Estimate dest amount:
                              </div>  
                            )}
                            <div>
                              <strong>
                                {props.exchange.destAmount} {props.destTokenSymbol}
                              </strong>                              
                            </div>
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
                              <div className={addPrefixClass(classSource)}>
                                <div>
                                  <input id="inputSource" className={addPrefixClass("source-input")} min="0" step="0.000001"
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
                  <div className={addPrefixClass('widget-layout')}>
                    {props.exchange.isHaveDestAmount && (
                      <div>
                        <div className={addPrefixClass("pay-info")}>
                          <div className={addPrefixClass("info-1")}>
                            {props.translate("transaction.you_about_to_pay") || "You are about to pay"}
                          </div>

                          <div className={addPrefixClass(`${haveProductAvatar ? "kyber-product-avatar" : ""} ${haveProductName ? "info-2 kyber-product-name" : "info-2"}`)}>
                            {haveProductAvatar && <div className={addPrefixClass("kyber-pAvatar")}>
                              <img src={props.exchange.productAvatar} />
                            </div>}

                            <div className={addPrefixClass("info-2__content")}>
                              <div>{props.translate("transaction.address") || "Address"}:</div>
                              <div>{props.global.params.receiveAddr.slice(0, 8)} ... {props.global.params.receiveAddr.slice(-6)}</div>
                            </div>


                            <div className={addPrefixClass("info-2__content")}>
                              <div>{props.translate("transaction.amount") || "Amount"}:</div>
                              <div>{('' + props.exchange.destAmount).length > 8 ? converter.roundingNumber(props.exchange.destAmount) : props.exchange.destAmount} {props.exchange.destTokenSymbol}</div>
                            </div>
                            {haveProductName && <div className={addPrefixClass("info-2__content")}>
                              <div>{props.translate("transaction.product_name") || "Name"}:</div>
                              <div>{props.exchange.productName}</div>
                            </div>}
                          </div>
                          <div className={addPrefixClass("info-3")}>

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

                        <div className={addPrefixClass("pay-info")}>
                          <div className={addPrefixClass("info-1")}>
                            {props.translate("transaction.you_about_to_pay") || "You are about to pay"}
                          </div>
                          <div className={addPrefixClass(`${haveProductAvatar ? "kyber-product-avatar" : ""} ${haveProductName ? "info-2 kyber-product-name" : "info-2"}`)}>
                            {haveProductAvatar && <div className={addPrefixClass("kyber-pAvatar")}>
                              <img src={props.exchange.productAvatar} />
                            </div>}
                            <div className={addPrefixClass("info-2__content")}>
                              <div>{props.translate("transaction.address") || "Address"}:</div>
                              <div>{props.global.params.receiveAddr.slice(0, 8)} ... {props.global.params.receiveAddr.slice(-6)}</div>
                            </div>
                            {haveProductName && <div className={addPrefixClass("info-2__content")}>
                              <div>{props.translate("transaction.product_name") || "Product name"}:</div>
                              <div>{props.exchange.productName}</div>
                            </div>}
                          </div>
                        </div>

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
                              <div className={addPrefixClass(classSource)}>
                                <div>
                                  <input id="inputSource" className={addPrefixClass("source-input")} min="0" step="0.000001"
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
              </div>
              <div>
                {props.advanceLayout}
              </div>
              <div className={addPrefixClass("exchange-pading")}>
                <div className={addPrefixClass("checkbox")}>
                  <input id="term-agree" type="checkbox" onChange={props.acceptedTerm} />
                  <label for="term-agree">
                    {props.translate("transaction.i_agree_to") || "Agree to"} <a href="https://files.kyber.network/tac.html" target="_blank" onClick={(e) => {if (props.global.analytics) props.global.analytics.callTrack("clickTermAndCondition")}}>{props.translate("transaction.term_and_condition") || "Terms &amp; Conditions"}</a>
                  </label>
                </div>
                <div className={addPrefixClass("button-payment")}>
                  <button className={props.classNamePaymentbtn} onClick={(e) => props.importAccount(e)}>{props.translate("transaction.next") || "Next"}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExchangeBodyLayout
