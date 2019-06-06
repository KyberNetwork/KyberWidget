import React from "react";
import * as converter from "../../utils/converter";
import {addPrefixClass} from "../../utils/className";

const OrderDetails = (props) => {
  const isUnlockWalletStep = props.exchange.step === 2;
  const isConfirmStep = props.exchange.step === 3;
  const isEthDest = props.exchange.destTokenSymbol === 'ETH';
  let gasUsed = props.exchange.gas;
  if (props.exchange.isNeedApprove) {
    gasUsed += props.exchange.gas_approve
  }

  function renderProducts() {
    return props.exchange.products.map((product, index) => {
      if (!product.name) {
        return false;
      }

      return (
        <div key={index}>
          <div className={addPrefixClass("widget-exchange__order-box")}>
            {product.image && (
              <img className={addPrefixClass("widget-exchange__order-image")} src={product.image} />
            )}
            <div className={addPrefixClass("widget-exchange__order-content common__flexbox between")}>
              <span className={addPrefixClass("widget-exchange__order-text widget-exchange__order-product-name")}>{product.name}</span>
              <span className={addPrefixClass("widget-exchange__order-text-bold")}>X{product.qty}</span>
            </div>
          </div>
        </div>
      );
    });
  }

  return (
    <div className={addPrefixClass(`widget-exchange__order theme-border ${isUnlockWalletStep ? 'common__desktop-display' : ''}`)}>
      <div className={addPrefixClass("widget-exchange__order-header")}>{props.translate('order_details.title') || "Order Details"}</div>

      <div className={addPrefixClass("widget-exchange__order-body")}>
        {renderProducts()}
        <div className={addPrefixClass("widget-exchange__order-box")}>
          <div className={addPrefixClass(`widget-exchange__order-text widget-exchange__order-amount ${!isEthDest ? 'align-top' : ''}`)}>
            {props.translate("common.amount") || "Amount"}:
          </div>
          <div className={addPrefixClass("widget-exchange__order-text-bolder")}>
            {(!props.global.params.receiveToken || !props.global.params.receiveAmount) && (
              <div className={addPrefixClass("widget-exchange__order-rate")}>
                {props.exchange.isSelectToken && (
                  <div>{props.translate("common.loading") || "Loading"}...</div>
                )}
                {!props.exchange.isSelectToken && (
                  <div>
                    {props.exchange.sourceTokenSymbol !== props.exchange.destTokenSymbol && (
                      <div>{props.exchange.offeredRate == "0" ? 0 : converter.caculateDestAmount(props.exchange.sourceAmount, props.exchange.offeredRate, 6)} {props.exchange.destTokenSymbol}</div>
                    )}
                    {props.exchange.sourceTokenSymbol === props.exchange.destTokenSymbol && (
                      <div>{props.exchange.sourceAmount || 0} {props.exchange.sourceTokenSymbol}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {(props.global.params.receiveToken && props.global.params.receiveAmount) && (
              <div className={addPrefixClass("widget-exchange__order-rate")}>
                {('' + props.exchange.destAmount).length > 8 ? converter.roundingNumber(props.exchange.destAmount) : props.exchange.destAmount || 0} {props.exchange.destTokenSymbol}
              </div>
            )}

            {!isEthDest && (
              <div className={addPrefixClass("widget-exchange__order-text-small")}>≈ {props.tokenRateToEth} ETH</div>
            )}
          </div>
        </div>

        {isConfirmStep && (
          <div className={addPrefixClass("widget-exchange__order-box")}>
            <div className={addPrefixClass("widget-exchange__order-text")}>
              {props.translate("transaction.fee") || "Transaction fee"}:
            </div>
            <div className={addPrefixClass("widget-exchange__order-text-bold")}>
              {props.exchange.isFetchingGas ? "Loading..." : converter.calculateGasFee(props.exchange.gasPrice, gasUsed)} ETH
            </div>
          </div>
        )}
      </div>
    </div>
  )
};

export default OrderDetails
