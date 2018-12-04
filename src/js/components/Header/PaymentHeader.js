import React from "react";
import {addPrefixClass} from "../../utils/className"

const PaymentHeader = (props) => {

  const getStepClass = (step) => {
    const currentStep = props.step;
    if (step === currentStep  && !props.haltPayment) {
      return "step-breadcrumb__item active";
    }
    return "step-breadcrumb__item";
  };

  return (
    <div>
      <div className={addPrefixClass("step-breadcrumb")}>
        {props.type === "swap" && (
          <div className={addPrefixClass(getStepClass(1))}>
            1. {props.translate("payment_header.step_swap") || "Swap"}
          </div>
        )}

        {props.type !== 'swap' && (
          <div className={addPrefixClass(getStepClass(1))}>
            1. {props.translate("payment_header.step_method") || "Payment method"}
          </div>
        )}

        <div className={addPrefixClass(getStepClass(2))}>
          2. {props.translate("payment_header.step_import") || "Address import"}
        </div>

        <div className={addPrefixClass(getStepClass(3))}>
          3. {props.translate("payment_header.step_confirm") || "Confirmation"}
        </div>
      </div>
    </div>
  )
};

export default PaymentHeader
