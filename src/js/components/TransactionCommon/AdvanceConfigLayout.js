import React from "react";
import { addPrefixClass } from "../../utils/className";
import SlideDown, { SlideDownTrigger, SlideDownContent } from "../../containers/CommonElements/SlideDown";
import { MinRate } from "../../containers/Exchange"
import GasConfig from "./GasConfig"

const AdvanceConfigLayout = (props) => {
  return (
    <div className={addPrefixClass("advance-config theme-border")}>
      <SlideDown active={props.isAdvConfigActive}>
        <SlideDownTrigger onToggleContent={() => props.toggleAdvConfig()}>
          <div className={addPrefixClass("advance-config__trigger")}>
            <div className={addPrefixClass("advance-config__title")}>Advanced (Optional)</div>
            <div className={addPrefixClass(`common__triangle common__triangle--small theme-border-top ${props.isAdvConfigActive ? 'up' : ''}`)}/>
          </div>
        </SlideDownTrigger>

        <SlideDownContent>
          <div className={addPrefixClass("advance-config__content")}>
            <div className={addPrefixClass("advance-config__close-button")} onClick={() => props.toggleAdvConfig()}>&times;</div>

            {(props.exchange.sourceTokenSymbol !== props.exchange.destTokenSymbol) && (
              <MinRate
                minConversionRate={props.exchange.minConversionRate}
                offeredRate={props.exchange.offeredRate}
                onSlippageRateChanged={props.onSlippageRateChanged}
                sourceTokenSymbol={props.exchange.sourceTokenSymbol}
                destTokenSymbol={props.exchange.destTokenSymbol}
              />
            )}

            <GasConfig
              selectedGas={props.exchange.selectedGas}
              gasPriceSuggest={props.exchange.gasPriceSuggest}
              handleGasChanged={props.handleGasChanged}
            />
          </div>
        </SlideDownContent>
      </SlideDown>
    </div>
  )
};

export default AdvanceConfigLayout
