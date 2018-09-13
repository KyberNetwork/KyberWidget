import React from "react"
import { PendingOverlay } from "../../components/CommonElement"
import {addPrefixClass} from "../../utils/className"

const PostExchangeBtn = (props) => {
  return (
    <div className={addPrefixClass("exchange-wrapper-btn")}>
      <div>
        <div>
          <a class={addPrefixClass(props.className)} onClick={props.submit} data-open="passphrase-modal">{props.translate("transaction.swap") ||  "Swap" }</a>
        </div>
          {props.rateToken}
      </div>                
      {props.modalExchange}
      <PendingOverlay isEnable={props.isConfirming || props.isApproving} />
    </div >
  )
}

export default PostExchangeBtn
