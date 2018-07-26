import React from "react";
import { connect } from "react-redux";

@connect((store) => {
  return {
    global: store.global
  }
})

export default class ErrorPayment extends React.Component {

  getErrorPayment = () => {
    return Object.keys(this.props.global.errorsPayment).map(key => {
      return <div key={key}>{this.props.global.errorsPayment[key]}</div>
    })
  };

  render = () => {
    return (
      <div className={"container"}>
        <div className={"error-payment"}>
          <div className={"error-payment__icon-container"}>
            <div className={"error-payment__icon"}></div>
            <div className={"error-payment__icon-text"}>Error!</div>
          </div>
          <div className={"error-payment__content"}>
            <div className={"error-payment__content-text error-payment__content-text--bold"}>{this.getErrorPayment()}</div>
            <div className={"error-payment__content-text"}>Please contact your merchant for wrong params</div>
            <div className={"error-payment__content-button"}>
              <div className={"payment-gateway__hollow-button"} onClick={() => window.close()}>Back to Website</div>
            </div>
          </div>
        </div>
      </div>
    )
  };
}
