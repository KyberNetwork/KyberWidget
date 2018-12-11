import React from "react";
import * as converter from "../../utils/converter";
import {addPrefixClass} from "../../utils/className";

const OrderDetails = (props) => {
  const haveProductName = props.exchange.productName && props.exchange.productName !== "";
  const haveProductAvatar = props.exchange.productAvatar && props.exchange.productAvatar !== "";
  let isError = false;
  let gasUsed = props.exchange.gas;

  if (props.exchange.isNeedApprove) {
    gasUsed += props.exchange.gas_approve
  }

  Object.keys(props.exchange.errors).map(key => {
    if (props.exchange.errors[key] && props.exchange.errors[key] !== "") {
      isError = true;
    }
  });

  return (
    <div className={addPrefixClass("widget-exchange__order theme-border")}>
      <div className={addPrefixClass("widget-exchange__order-header")}>Order details</div>

      <div className={addPrefixClass("widget-exchange__order-body")}>
        {haveProductName && (
          <div className={addPrefixClass("widget-exchange__order-box")}>
            <span className={addPrefixClass("widget-exchange__order-text")}>{props.exchange.productName}</span>
            <span className={addPrefixClass("widget-exchange__order-text-bold")}>X{props.exchange.productQty}</span>
          </div>
        )}
        {haveProductAvatar && (
          <div className={addPrefixClass("widget-exchange__order-box")}>
            <img src={props.exchange.productAvatar} />
          </div>
        )}
        <div className={addPrefixClass("widget-exchange__order-box")}>
          <div className={addPrefixClass("widget-exchange__order-text widget-exchange__order-amount")}>
            {props.translate("transaction.amount") || "Amount"}:
          </div>
          <div className={addPrefixClass("widget-exchange__order-text-bolder")}>
            {(!props.global.params.receiveToken || !props.global.params.receiveAmount) && (
              <div>
                {props.exchange.isSelectToken && (
                  <div>Loading...</div>
                )}
                {!props.exchange.isSelectToken && (
                  <div>
                    {props.exchange.sourceTokenSymbol !== props.exchange.destTokenSymbol && (
                      <div>{props.exchange.offeredRate == "0" || isError ? 0 : converter.caculateDestAmount(props.exchange.sourceAmount, props.exchange.offeredRate, 4)} {props.exchange.destTokenSymbol}</div>
                    )}
                    {props.exchange.sourceTokenSymbol === props.exchange.destTokenSymbol && (
                      <div>{props.exchange.sourceAmount || 0} {props.exchange.sourceTokenSymbol}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {(props.global.params.receiveToken && props.global.params.receiveAmount) && (
              <div>{('' + props.exchange.destAmount).length > 8 ? converter.roundingNumber(props.exchange.destAmount) : props.exchange.destAmount || 0} {props.exchange.destTokenSymbol}</div>
            )}

            <div className={"widget-exchange__order-text-small"}>≈ 1.068 ETH</div>
          </div>
        </div>

        {props.step === 3 && (
          <div className={"widget-exchange__order-box"}>
            <div className={addPrefixClass("widget-exchange__order-text")}>
              {props.translate("transaction.transaction_fee") || "Transaction fee"}:
            </div>
            <div className={addPrefixClass("widget-exchange__order-text-bold")}>
              {props.exchange.isFetchingGas ? "Loading..." : converter.calculateGasFee(props.exchange.gasPrice, gasUsed)}
            </div>
          </div>
        )}

        <div className={addPrefixClass("widget-exchange__order-box widget-exchange__order-address theme-border")}>
          <div className={addPrefixClass("widget-exchange__order-text-light")}>
            {props.translate("transaction.address") || "Address"}:
          </div>
          <div className={addPrefixClass("widget-exchange__order-text")}>
            {props.global.params.receiveAddr.slice(0, 19)} ... {props.global.params.receiveAddr.slice(-6)}
          </div>
        </div>
      </div>
    </div>
  )
};

export default OrderDetails
