import React from "react"
import * as converter from "../../utils/converter"
import {addPrefixClass} from "../../utils/className"

const ExchangeBodyLayout = (props) => {
  var errorSource = []
  var errorExchange = false
  Object.keys(props.exchange.errors).map(key => {
    if (props.exchange.errors[key] && props.exchange.errors[key] !== "") {
      errorSource.push(props.translate(props.exchange.errors[key]) || props.exchange.errors[key])
      errorExchange = true
    }
  })

  var tokenPrice = 0;

  if (props.exchange.isSelectToken) {
    tokenPrice = <img src={require('../../../assets/img/waiting.svg')} />
  } else {
    if (props.exchange.expectedRate != 0 && props.exchange.productPrice) {
      var ethValue = converter.toEther(props.exchange.productPrice)
      tokenPrice = converter.roundingNumber(converter.caculateSourceAmount(ethValue, props.exchange.expectedRate, 6))
    }
  }

  var errorShow = errorSource.map((value, index) => {
    return <span class="error-text" key={index}>{value}</span>
  });

  var productPrice = props.exchange.productPrice ? converter.toEther(props.exchange.productPrice) : 0;

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

                {/* <div className="payment-gateway__step-title payment-gateway__step-title--1">
              {props.translate("transaction.choose_your_payment") || "Choose your payment method"}
            </div> */}
           

                <div>
                  <div className={addPrefixClass("pay-info")}>
                    <div className={addPrefixClass("info-1")}>
                      {props.translate("transaction.you_about_to_pay") || "You are about to pay"}
                    </div>
                    <div className={addPrefixClass(props.global.params.productAvatar &&  props.global.params.productAvatar!= "" ? "product-avatar" : "" )}>
                      {props.global.params.productAvatar &&  props.global.params.productAvatar != "" ?
                        <div className={addPrefixClass("kyber-avatar")}><img src={props.global.params.productAvatar} /></div> : ""
                      }

                      <div className={addPrefixClass("info-2")}>
                        {props.global.params.productId && (
                          <div className={addPrefixClass("info-2__content")}>
                            <div>Product Id:</div>
                            <div>{props.global.params.productId}</div>
                          </div>
                        )}

                        {props.global.params.productName && props.global.params.productName !== "" && (
                          <div className={addPrefixClass("info-2__content")}>
                            <div>Product Name:</div>
                            <div>{props.global.params.productName}</div>
                          </div>
                        )}

                        {productPrice != 0 && (
                          <div className={addPrefixClass("info-2__content")}>
                            <div>Price:</div>
                            <div>{productPrice} ETH</div>
                          </div>
                        )}

                        {productPrice == 0 && (
                          <div className={addPrefixClass("info-2__error")}>
                            This monster is not catchable
                          </div>
                        )}
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

                        {/* {props.exchange.catchable === false && (
                          <div className={addPrefixClass("payment-error")}>
                            This monster is not catchable
                          </div>
                        )} */}

                        {/* {props.exchange.expectedRate == 0 && props.exchange.expectedRate && (
                          <div className={addPrefixClass("payment-error")}>
                            Cannot catch monster with {props.exchange.sourceTokenSymbol} at the momment
                          </div>
                        )} */}

                        {props.exchange.expectedRate != 0 && (
                        <div className={addPrefixClass("amount-pay")}>
                          <div>{props.translate("transaction.estimate_value_should_pay_in_token") || "Estimate value you should pay"} in {props.exchange.sourceTokenSymbol}</div>
                          <div>{tokenPrice} {props.exchange.sourceTokenSymbol}</div>
                        </div>
                        )}
                      </div>
                      <div className={addPrefixClass(errorExchange ? "error" : "")}>
                        {errorShow}
                      </div>
                    </div>
                  </div>
                </div>
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
                  <button className={props.classNamePaymentbtn} onClick={(e) => props.importAccount(e)}>
                    {props.translate("transaction.next") || "Next"}
                  </button>
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
