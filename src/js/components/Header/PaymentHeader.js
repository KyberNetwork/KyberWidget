import React from "react";
import {addPrefixClass} from "../../utils/className"

const PaymentHeader = (props) => {

  const getStepClass = (step) => {
    const currentStep = props.step;
    if (currentStep >= step  && !props.haltPayment) {
      return "step-breadcrumb__step active theme-bg";
    }
    return "step-breadcrumb__step";
  };

  if (!props.type) {
    return '';
  }

  return (
    <div className={addPrefixClass("step-breadcrumb theme-shadow-small")}>
      {props.type === "swap" && (
        <div className={addPrefixClass("step-breadcrumb__item")}>
          <span className={addPrefixClass(getStepClass(1))}>1</span>
          <span className={addPrefixClass("step-breadcrumb__text")}>{props.translate("common.swap") || "Swap"}</span>
        </div>
      )}

      {props.type !== 'swap' && (
        <div className={addPrefixClass("step-breadcrumb__item")}>
          <span className={addPrefixClass(getStepClass(1))}>1</span>
          <span className={addPrefixClass("step-breadcrumb__text")}>{props.translate("payment_header.step_method") || "Payment Method"}</span>
        </div>
      )}

      <div className={addPrefixClass("step-breadcrumb__item")}>
        <span className={addPrefixClass(getStepClass(2))}>2</span>
        <span className={addPrefixClass("step-breadcrumb__text")}>{props.translate("payment_header.step_import") || "Unlock Wallet"}</span>
      </div>

      <div className={addPrefixClass("step-breadcrumb__item")}>
        <span className={addPrefixClass(getStepClass(3))}>3</span>
        <span className={addPrefixClass("step-breadcrumb__text")}>{props.translate("common.confirm") || "Confirm"}</span>
      </div>
    </div>
  )
};

export default PaymentHeader
