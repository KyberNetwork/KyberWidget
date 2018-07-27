import React from "react"
import { roundingNumber } from "../../utils/converter"
import BLOCKCHAIN_INFO from "../../../../env"
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import { CopyToClipboard } from 'react-copy-to-clipboard'
//import AnalyzeLogModal from './AnalyzeLogModal'

const TransactionLoadingView = (props) => {
  var isBroadcasting = props.broadcasting
  var broadcastError = props.error

  isBroadcasting = props.broadcasting
  broadcastError = props.error

  if (isBroadcasting) {
    var classPending = !props.error ? " pulse" : ""
    return (
      <div>
        <div className="title">
        {broadcastError  &&
           <div>
              <div className="icon icon--failed"></div>
              <div className="title-status">{ props.translate('transaction.failed') || "Failed!" }</div>
            </div>
        }
        {!broadcastError &&
          <div>
            <div className="icon icon--broadcasted"></div>
            <div className="title-status">{ props.translate('transaction.broadcasting') || "Broadcasting!" }</div>
          </div>
        }
        </div>
        <a className="x" onClick={(e) => props.onCancel(e)}>&times;</a>
        <div className="content with-overlap tx-loading">
          <div className="row">
            <ul class="broadcast-steps">
              {!broadcastError &&
                <li class="pending">
                  <h4 class="font-w-b">{props.translate("transaction.broadcasting_blockchain") || "Broadcasting the transaction to the blockchain"}
                  </h4>
                </li>
              }
              {broadcastError &&
                <li class="failed">
                  <h4 class="font-w-b">{props.translate("transaction.cound_not_broadcast") || "Couldn't broadcast your transaction to the blockchain"}</h4>
                  <div class="reason">{broadcastError}</div>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    )
  }



  var getTooltipCopy = () => {
    return props.isCopied ?
      (props.translate("transaction.copied") || "Copied!") :
      (props.translate("transaction.copy_tx") || "Copy transaction hash")
  }


  var classPending = props.status === "pending" ? " pulse" : ""
  // var analyzeBtn = ""

  // if (props.type === "exchange") {
  //   analyzeBtn = (
  //     <a className="analyze" onClick={(e) => handleAnalyze(e)}>
  //       {props.translate('transaction.analyze') || "Show reasons"}
  //     </a>
  //   )
  // }
  return (
    <div>
      <div className="title">
      
          <div>
            <div className="icon icon--broadcasted"></div>
            <div className="title">{ props.translate('transaction.broadcasted') || "Broadcasted!" }</div>
          </div>
        
      </div>
      <div className="content with-overlap">
        <div className="row">
          <div class="info tx-title">
            <div className="tx-title-text">{props.translate("transaction.transaction") || "Transaction hash"}</div>
            <div className="tx-hash">
              <a class="text-light" href={BLOCKCHAIN_INFO.ethScanUrl + 'tx/' + props.txHash} target="_blank"
                title={props.translate("modal.view_on_etherscan") || "View on Etherscan"} >
                {props.txHash}
              </a>
              <a className="copy-tx" data-for='copy-tx-tip' data-tip=""
                onClick={props.handleCopy}
                onMouseLeave={props.resetCopy} >
                <CopyToClipboard text={props.txHash}>
                  <img src={require("../../../assets/img/copy-address.svg")} />
                </CopyToClipboard>
              </a>
              <ReactTooltip getContent={[() => getTooltipCopy()]} place="right" id="copy-tx-tip" type="light" />
            </div>
          </div>
      
        </div>
      </div>


    </div>
  )
}


export default TransactionLoadingView
