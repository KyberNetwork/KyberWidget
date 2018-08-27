import React from "react"
import BLOCKCHAIN_INFO from "../../../../env"
import ReactTooltip from 'react-tooltip'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import * as widgetOptions from "../../utils/widget-options"

const TransactionLoadingView = (props) => {
  var isBroadcasting = props.broadcasting;
  var broadcastError = props.error;

  if (isBroadcasting) {
    return (
      <div className="transaction-loading-container">
        <div className="transaction-loading">
          <div className="container">
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
            <div className="content with-overlap tx-loading">
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

          <div className="container transaction-loading__button-container">
            <div className={"payment-gateway__hollow-button"} onClick={widgetOptions.onClose}>
              {props.translate("transaction.back_to_website") || "Back to Website"}
            </div>
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

  return (
    <div className="transaction-loading-container">
      <div className="transaction-loading">
        <div className="container">
          <div className="title">
            <div>
              <div className="icon icon--broadcasted"></div>
              <div className="title">{ props.translate('transaction.broadcasted') || "Broadcasted!" }</div>
            </div>
          </div>
          <div className="content with-overlap">
            <div class="info tx-title">
              <div className="tx-title-text">{props.translate("transaction.transaction") || "Transaction hash"}</div>
              <div className="tx-hash">
                <a class="text-light" href={BLOCKCHAIN_INFO[props.network].ethScanUrl + 'tx/' + props.txHash} target="_blank"
                   title={props.translate("modal.view_on_etherscan") || "View on Etherscan"} onClick={props.analytics.callTrack("viewTxOnEtherscan")}>
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

        <div className="container transaction-loading__button-container">
          <div className={"payment-gateway__hollow-button"} onClick={widgetOptions.onClose(props.analytics)}>
          {props.translate("transaction.back_to_website") || "Back to Website"}
        </div>
        </div>
      </div>
    </div>
  )
};

export default TransactionLoadingView
