import React from "react";
import { addPrefixClass } from "../../utils/className";

const AdvanceConfigLayout = (props) => {

  var toggleShowAdvance = (e) => {
    var advanceContent = document.getElementById("advance-content");
    var advanceArrow = document.getElementById("advance-arrow");
    var advanceTitle = document.getElementById("title-advanced");
    if (advanceContent.className === addPrefixClass("show-advance")) {
        advanceContent.className = "";
        advanceArrow.className = "";
        advanceTitle.className = addPrefixClass("title-advanced")
        props.analytics.callTrack("clickToAdvance", "hide")
    } else {
        advanceContent.className = addPrefixClass("show-advance");
        advanceArrow.className = addPrefixClass("advance-arrow-up");
        props.analytics.callTrack("clickToAdvance", "show")
        advanceTitle.className = addPrefixClass("title-advanced show-content")
    }
  }
  return (
    <div className={addPrefixClass("advance-config-wrapper")} id="advance-config-wrapper">
      <div className={addPrefixClass("advance-title-mobile title")} onClick={(e) => toggleShowAdvance()}>
        <div className={addPrefixClass("title-advanced")} id="title-advanced">
          <img src={require("../../../assets/img/widget/dropdown-advance.svg")} id="advance-arrow"/>
          {props.translate("transaction.advanced") || "Advanced"}
          <div className={addPrefixClass("border-advance")}></div>
        </div>
      </div>
      <div className={addPrefixClass("advance-config")}>
        {/* <div className="title advance-title-desktop">{props.translate("transaction.advanced") || "Advanced"}</div> */}
        <div id="advance-content">
          <div className={addPrefixClass("advance-content")}>
            <div>
                {props.gasConfig}
            </div>

            <div>
              {props.minRate}
            </div>

            <div className={addPrefixClass("transaction-fee")}>
              <div className={addPrefixClass("title-fee")}>
                {props.translate("transaction.transaction_fee") || "Transaction Fee"}
              </div>
              <div>{props.totalGas} ETH</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdvanceConfigLayout
