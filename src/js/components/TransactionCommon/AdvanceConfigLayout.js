
import React from "react"

const AdvanceConfigLayout = (props) => {

  var toggleShowAdvance = (e) => {
    var advanceContent = document.getElementById("advance-content");
    var advanceArrow = document.getElementById("advance-arrow");
    if (advanceContent.className === "show-advance") {
        advanceContent.className = "";
        advanceArrow.className = "";
        props.analytics.callTrack("clickToAdvance", "hide")
    } else {
        advanceContent.className = "show-advance";
        advanceArrow.className = "advance-arrow-up";
        props.analytics.callTrack("clickToAdvance", "show")
    }
  }
  return (
    <div className="advance-config">
      {/* <div className="title advance-title-desktop">{props.translate("transaction.advanced") || "Advanced"}</div> */}

      <div className="advance-title-mobile title" onClick={(e) => toggleShowAdvance()}>
        <div className="title-advanced">
          <img src={require("../../../assets/img/widget/dropdown-advance.svg")} id="advance-arrow"/>
          {props.translate("transaction.advanced") || "Advanced"}
        </div>        
      </div>
      <div id="advance-content">
        <div className="advance-content">
          <div>
              {props.gasConfig}
          </div>

          <div>
            {props.minRate}
          </div>

          <div className="transaction-fee">
            <div className="title-fee">{props.translate("transaction.transaction_fee") || "Transaction Fee"}</div>
            <div>{props.totalGas} ETH</div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdvanceConfigLayout
