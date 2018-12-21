import React from "react";
import * as converter from "../../utils/converter";
import {addPrefixClass} from "../../utils/className";

const TransactionDetails = (props) => {
  let gasUsed = props.exchange.gas;
  const isUnlockWalletStep = props.exchange.step === 2;

  if (props.exchange.isNeedApprove) {
    gasUsed += props.exchange.gas_approve
  }

  return (
    <div className={addPrefixClass(`widget-exchange__order theme-border ${isUnlockWalletStep ? 'common__desktop-display' : ''}`)}>
      <div className={addPrefixClass("widget-exchange__order-header")}>Transaction Details</div>

      <div className={addPrefixClass("widget-exchange__order-body")}>
        <div className={addPrefixClass("widget-exchange__order-box")}>
          <span className={addPrefixClass("widget-exchange__order-text")}>From</span>
          <span className={addPrefixClass("widget-exchange__order-text-bolder")}>
            {props.exchange.sourceAmount} {props.exchange.sourceTokenSymbol}
          </span>
        </div>

        <div className={addPrefixClass("widget-exchange__order-box")}>
          <span className={addPrefixClass("widget-exchange__order-text")}>To</span>
          <span className={addPrefixClass("widget-exchange__order-text-bolder")}>
            {props.exchange.destAmount} {props.exchange.destTokenSymbol}
          </span>
        </div>

        {props.exchange.step === 3 && (
          <div className={addPrefixClass("widget-exchange__order-box widget-exchange__order-address theme-border")}>
            <div className={addPrefixClass("widget-exchange__order-text")}>Transaction Fee:</div>
            <div className={addPrefixClass("widget-exchange__order-text-bold")}>
              {props.exchange.isFetchingGas ? "Loading..." : converter.calculateGasFee(props.exchange.gasPrice, gasUsed)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
};

export default TransactionDetails
