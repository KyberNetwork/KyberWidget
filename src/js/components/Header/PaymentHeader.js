import React from "react";

const PaymentHeader = (props) => {
  return (
    <div>
      <div className="kyber-payment-logo-container container">
        <div className="kyber-payment-logo"></div>
      </div>
      <div className="step-breadcrumb container">
        <div className="step-breadcrumb__item">{props.translate("payment_header.step_method") || "Payment method"}</div>
        <div className="step-breadcrumb__item">{props.translate("payment_header.step_import") || "Address import"}</div>
        <div className="step-breadcrumb__item">{props.translate("payment_header.step_confirm") || "Confirmation"}</div>
      </div>
    </div>
  )
};

export default PaymentHeader
