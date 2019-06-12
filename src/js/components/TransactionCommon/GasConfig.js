import React from "react"
import { addPrefixClass } from "../../utils/className";

const GasConfig = (props) => {
  const gasPriceSuggest = props.gasPriceSuggest;
  const gasOptions = [
    {key: "f", text: props.translate('common.fast') || "Fast", value: gasPriceSuggest.fastGas},
    {key: "s", text: props.translate('common.regular') || "Regular", value: gasPriceSuggest.standardGas},
    {key: "l", text: props.translate('common.slow') || "Slow", value: gasPriceSuggest.safeLowGas}
  ];

  return (
    <div className={addPrefixClass("advance-config__gas")}>
      <div className={addPrefixClass("advance-config__gas-title")}>{props.translate('advanced.gas_fee') || "GAS fee (Gwei"}</div>
      <div className={addPrefixClass("common__flexbox between")}>
        {gasOptions.map((item, index) => {
          return (
            <label className={addPrefixClass("common__radio")} key={index}>
              <span className={addPrefixClass("common__radio-text")}>
                <span className={addPrefixClass("common__radio-text--margin")}>{item.value}</span>
                <span>{item.text}</span>
              </span>
              <input
                className={addPrefixClass("common__radio-input theme-radio")}
                type="radio"
                name="gasAmount"
                value={item.key}
                defaultChecked={props.selectedGas == item.key}
                onChange={() => props.handleGasChanged(item.value, item.key, item.text)}
              />
              <span className={addPrefixClass("common__radio-icon")}/>
            </label>
          )
        })}
      </div>
    </div>
  )
};

export default GasConfig
