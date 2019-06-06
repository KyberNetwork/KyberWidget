import React from "react"
import { addPrefixClass } from "../../utils/className"

const ProcessingModal = (props) => {
  return (
    <div>
      {props.isEnable && (
        <div className={addPrefixClass("common__overlay")}>
          <div className={addPrefixClass("common__overlay-content")}>
            <div className={addPrefixClass("common__overlay-loading theme-loading-icon")}/>
            <div className={addPrefixClass("common__overlay-text")}>
              {props.translate("common.processing") || "Processing"}
            </div>

            {props.checkTimeImportLedger && (
              <div className={addPrefixClass("common__overlay-warning")}>
                <React.Fragment>
                  <div>{props.translate("error.make_sure") || "Please make sure"}:</div>
                  <div className={addPrefixClass("text-left")}>
                    <div>{props.translate("error.ledger_plugged_in") || "- Your Ledger is properly plugged in."}</div>
                    <div>{props.translate("error.ledger_logged_in") || "- You have logged into your Ledger."}</div>
                  </div>
                </React.Fragment>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
};

export default ProcessingModal
