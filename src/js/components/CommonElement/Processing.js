import React from "react"
import {addPrefixClass} from "../../utils/className"

const ProcessingModal = (props) => {
  return (
    <div>{props.isEnable ?
      <div id="waiting" class={addPrefixClass(props.checkTimeImportLedger ? 'ledger' : '')}>
        <div className={addPrefixClass("caption")}>
          {props.translate("transaction.processing") || "Processing"}
          <div>
            {props.checkTimeImportLedger ?
              <React.Fragment>
                {props.translate("error.please_make_sure") || "Please make sure"}: <br />
                <div className={addPrefixClass("text-left")}>
                {props.translate("error.ledger_plugged_in") || "- Your Ledger is properly plugged in."}<br />
                {props.translate("error.ledger_logged_in") || "- You have logged into your Ledger."}<br />
                </div>
              </React.Fragment>              
            : ''}
          </div>
        </div>
      </div>
      : ''}
    </div>
  )

}
export default ProcessingModal