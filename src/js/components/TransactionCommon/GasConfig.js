
import React from "react"
import ReactTooltip from 'react-tooltip'
import { filterInputNumber } from "../../utils/validators";
import GasOption from './GasOption';
import {addPrefixClass} from "../../utils/className"

const GasConfig = (props) => {
  let gas_option = {"f":props.translate("fast") || 'Fast',"l":props.translate("low") || 'Slow',"s":props.translate("standard") || 'Standard'}
  function specifyGasPrice(value) {
    if(value==="f") {
      props.selectedGasHandler(gasPriceSuggest.fastGas, value)
      props.analytics.callTrack("chooseGas", "Fast", gasPriceSuggest.fastGas)
    }
    else if(value==="l") {
      props.selectedGasHandler(gasPriceSuggest.safeLowGas, value)
      props.analytics.callTrack("chooseGas", "Slow", gasPriceSuggest.safeLowGas)
    }
    else if(value==="s") {
      props.selectedGasHandler(gasPriceSuggest.standardGas, value)
      props.analytics.callTrack("chooseGas", "Standard", gasPriceSuggest.standardGas)
    }
  }
  function handleChangeGasPrice(e) {
    filterInputNumber(e, e.target.value)
    props.inputGasPriceHandler(e.target.value)
  }

  function tooltipGasSuggest(time) {
    return props.translate("transaction.transaction_time", { time: time })
  }
 
  var caption = props.maxGasPrice ?
    props.translate("transaction.transaction_gasprice_50") || "Higher gas price, faster transaction. Max gas price: 50 Gwei" :
    props.translate("transaction.transaction_gasprice") || "Higher gas price, faster transaction"
  var gasPriceSuggest = props.gasPriceSuggest
  return (
    <div className={addPrefixClass("gas-config")}>
      <div>
        <span className={addPrefixClass("sub_title")}>{props.translate("transaction.gas_price") || "GAS PRICE"}</span>
        {/* <p className={addPrefixClass("sub_title">(inclusive in the rate)</p> */}
      </div>
      <div className={addPrefixClass(!props.gasPriceError ? "" : "error")}>
        <div className={addPrefixClass("gas-change")}>
          <div className={addPrefixClass("gas_input")}>
            <input type="number" min="0" max="99" className={addPrefixClass("gas-price-input")} step="0.1" value={props.gasPrice} onChange={handleChangeGasPrice} maxLength="20" autoComplete="off" onFocus={(e) => props.analytics.callTrack("customNewGas")} />
          </div>
          <div className={addPrefixClass("gas_input-label-container")}>
            <div className={addPrefixClass("gas_input-lable")}>Gwei</div>
            <div className={addPrefixClass("gas_input-option")}>
              <GasOption gasOptions={gas_option} focus={props.selectedGas} onChange={specifyGasPrice}/>
            </div>
          </div>
        </div>
        {/* {props.gasPriceError && <div class="error-text mb-1">{props.translate(props.gasPriceError, { maxGas: props.maxGasPrice })}</div>} */}
        {props.page === "exchange" ?
          <div className={addPrefixClass("des-down")}>{props.translate("transaction.transaction_gasprice") 
            || "Higher gas price, faster transaction."}
            <br></br>
            {props.translate("transaction.max_gas_price", { maxGas: props.maxGasPrice }) || `Max gas price: ${props.maxGasPrice} Gwei`}
          </div>
          : <div className={addPrefixClass("des-down")}>{props.translate("transaction.transaction_gasprice") 
            || "Higher gas price, faster transaction."}                        
          </div>
        }
      </div>
    </div>
  )
}
export default GasConfig
