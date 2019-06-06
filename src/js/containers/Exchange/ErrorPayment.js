import React from "react";
import { connect } from "react-redux";
import { getTranslate } from 'react-localize-redux'
import * as widgetOptions from "../../utils/widget-options"
import { addPrefixClass } from "../../utils/className"

@connect((store) => {
  const translate = getTranslate(store.locale)
  return {
    global: store.global,
    translate: translate
  }
})
export default class ErrorPayment extends React.Component {
  getErrorPayment = () => {
    return Object.keys(this.props.global.errorsPayment).map(key => {
      return <div key={key}>{this.props.global.errorsPayment[key]}</div>
    })
  };

  closeWidget() {
    widgetOptions.onClose()
    if (this.props.global.analytics) this.props.global.analytics.callTrack("backToWebsite")
  }

  render = () => {
    return (
      <div className={addPrefixClass("broadcast")}>
        <div className={addPrefixClass("broadcast__header")}>
          <div className={addPrefixClass("broadcast__icon failed")}/>
          <div className={addPrefixClass("broadcast__title")}>{this.props.translate('common.error') || "Error"}</div>
        </div>
        <div className={addPrefixClass("broadcast__body list")}>
          <div className={addPrefixClass("broadcast__list broadcast__text-light")}>{this.getErrorPayment()}</div>
          <div className={addPrefixClass("broadcast__text-bold")}>{this.props.translate("transaction.contact_merchant") || "Please contact your merchant for wrong params"}</div>
        </div>
        <div className={addPrefixClass("widget-exchange__bot common__flexbox center")}>
          <div className={addPrefixClass("common__button hollow small theme-button")} onClick={(e) => this.closeWidget()}>
            {this.props.translate("transaction.back_to_website") || "Back to Website"}
          </div>
        </div>
      </div>
    )
  };
}
