import React from "react";

const PaymentHeader = (props) => {

  var getClass = (step) => {
    var currentStep = props.step
    if (step === currentStep && !props.haltPayment) {
      return "step-breadcrumb__item active"
    }
    return "step-breadcrumb__item"
  }
  
  return (
    <div>
      <div className="kyber-payment-logo-container">
        <div className="kyber-payment-logo">
          {/* <img src={require("../../../assets/img/widget/pure-logo.svg")}/> */}
          {/* KyberWidget */}
        </div>
      </div>
      <div className="step-breadcrumb container">
        {props.type === 'swap' && (
          <div className={getClass(1)}>1. {props.translate("payment_header.step_swap") || "Swap"}</div>
        )}
        {props.type !== 'swap' && (
          <div className={getClass(1)}>1. {props.translate("payment_header.step_method") || "Payment method"}</div>
        )}
        <div className="arrow-right"></div>
        <div className={getClass(2)}>2. {props.translate("payment_header.step_import") || "Address import"}</div>
        <div className="arrow-right"></div>
        <div className={getClass(3)}>3. {props.translate("payment_header.step_confirm") || "Confirmation"}</div>
      </div>
    </div>
  )
};

export default PaymentHeader
