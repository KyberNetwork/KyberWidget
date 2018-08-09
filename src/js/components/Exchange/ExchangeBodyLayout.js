import React from "react"

import * as converter from "../../utils/converter"

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
    if (props.exchange.expectedRate != 0 && props.exchange.monsterInETH) {
      var ethValue = converter.toEther(props.exchange.monsterInETH)
      tokenPrice = converter.roundingNumber(converter.caculateSourceAmount(ethValue, props.exchange.expectedRate, 6))
    }
  }

  var errorShow = errorSource.map((value, index) => {
    return <span class="error-text" key={index}>{value}</span>
  });

  return (
    <div id="exchange">
      <div className="grid-x">
        <div className="cell medium-12 large-12 swap-wrapper">
          <div className="grid-x exchange-col">
            <div className="cell exchange-col-1">

              <div className="exchange-pading exchange-pading-top">
                {props.networkError !== "" && (
                  <div className="network_error">
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
                  <div className="pay-info">
                    <div className="info-1">
                      {props.translate("transaction.you_about_to_pay") || "You are about to pay"}
                    </div>
                    {props.exchange.monsterAvatar &&  props.exchange.monsterAvatar != "" ?
                      <div className="monster-avatar"><img src={props.exchange.monsterAvatar} /></div> : ""
                    }
                    <div className="info-2">
                      <div className="info-2__content">
                        <div>Monster Id:</div>
                        <div>{props.exchange.monsterId}</div>
                      </div>

                      {props.exchange.monsterName && props.exchange.monsterName !== "" && (
                        <div className="info-2__content">
                          <div>Monster Name:</div>
                          <div>{props.exchange.monsterName}</div>
                        </div>
                      )}

                      {props.exchange.catchable && (
                        <div className="info-2__content">
                          <div>Price:</div>
                          <div>{props.exchange.monsterInETH ? converter.toEther(props.exchange.monsterInETH): 0} ETH</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="choose-payment">
                      <span className="transaction-label">
                        {props.translate("transaction.exchange_paywith") || "PAY WITH"}
                      </span>
                      <div className={errorExchange ? "error select-token-panel" : "select-token-panel"}>
                        {props.tokenSourceSelect}

                        {props.exchange.catchable === false && (
                          <div className="payment-error">
                            This monster is not catchable
                          </div>
                        )}

                        {props.exchange.expectedRate == 0 && props.exchange.expectedRate && (
                          <div className="payment-error">
                            Cannot catch monster with {props.exchange.sourceTokenSymbol} at the momment
                          </div>
                        )}

                        {props.exchange.expectedRate != 0 && props.exchange.catchable && (
                        <div className="amount-pay">
                          <div>{props.translate("transaction.estimate_value_should_pay_in_token") || "Estimate value you should pay"} in {props.exchange.sourceTokenSymbol}</div>
                          <div>{tokenPrice} {props.exchange.sourceTokenSymbol}</div>
                        </div>
                        )}
                      </div>
                      <div className={errorExchange ? "error" : ""}>
                        {errorShow}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {props.advanceLayout}
              </div>

              <div className="exchange-pading">
                <div class="checkbox">
                  <input id="term-agree" type="checkbox" onChange={props.acceptedTerm} />
                  <label for="term-agree">
                    {props.translate("transaction.i_agree_to") || "I agree to"} <a href="https://files.kyber.network/tac.html" target="_blank">{props.translate("transaction.term_and_condition") || "Terms &amp; Conditions"}</a>
                  </label>
                </div>

                <button className={props.classNamePaymentbtn} onClick={(e) => props.importAccount(e)}>
                  {props.translate("transaction.next") || "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExchangeBodyLayout
