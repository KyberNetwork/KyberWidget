import React from "react"
import { connect } from "react-redux"
import { getTranslate } from "react-localize-redux"
import * as converter from "../../utils/converter"
import { addPrefixClass } from "../../utils/className"

@connect((store) => {
  return { 
    exchange: store.exchange,
    translate: getTranslate(store.locale),
    analytics: store.global.analytics
  }
})
export default class MinRate extends React.Component {
  render = () => {
    const percent = Math.round(parseFloat(converter.caculatorPercentageToRate(this.props.minConversionRate, this.props.offeredRate)));
    const exchangeRate = converter.toT(this.props.offeredRate);
    const roundExchangeRate = converter.roundingNumber(exchangeRate);
    const slippageExchangeRate = converter.roundingNumber(exchangeRate * (percent / 100));

    return (
      <div className={addPrefixClass("advance-config__rate")}>
        <div className={addPrefixClass("advance-config__rate-title")}>
          Still proceed if {this.props.sourceTokenSymbol}-{this.props.destTokenSymbol} rate goes down by:
        </div>
        <div className={addPrefixClass("common__flexbox between")}>
          <label className={addPrefixClass("common__radio")}>
            <span className={addPrefixClass("common__radio-text")}>3%</span>
            <input
              className={addPrefixClass("common__radio-input theme-radio")}
              type="radio"
              name="slippageRate"
              value="97"
              defaultChecked
              onChange={this.props.onSlippageRateChanged}
            />
            <span className={addPrefixClass("common__radio-icon")}/>
          </label>
          <label className={addPrefixClass("common__radio")}>
            <span className={addPrefixClass("common__radio-text")}>Any-rate</span>
            <input
              className={addPrefixClass("common__radio-input theme-radio")}
              type="radio"
              name="slippageRate"
              value="0"
              onChange={this.props.onSlippageRateChanged}
            />
            <span className={addPrefixClass("common__radio-icon")}/>
          </label>
          <label className={addPrefixClass("common__radio")}>
            <span className={addPrefixClass("common__radio-text")}>Custom</span>
            <input className={addPrefixClass("common__radio-input theme-radio")} type="radio" name="slippageRate"/>
            <span className={addPrefixClass("common__radio-icon with-input")}/>
            <input
              className={addPrefixClass("advance-config__rate-input")}
              type="number"
              min="0"
              max="100"
              onChange={(e) => this.props.onSlippageRateChanged(e, true)}
            />
            <span className={addPrefixClass("common__radio-text")}> %</span>
          </label>
        </div>
        <div className={addPrefixClass("advance-config__rate-desc")}>Transaction will be reverted if rate of {this.props.sourceTokenSymbol}-{this.props.destTokenSymbol} is lower than {slippageExchangeRate} (Current rate <b>{roundExchangeRate}</b>)</div>
      </div>
    )
  }
}
