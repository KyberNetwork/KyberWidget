import React from "react"
import BLOCKCHAIN_INFO from "../../../../env"
import ReactTooltip from 'react-tooltip'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import {addPrefixClass} from "../../utils/className"
import * as widgetOptions from "../../utils/widget-options"

const TransactionLoadingView = (props) => {
  var isBroadcasting = props.broadcasting;
  var broadcastError = props.error;

  var closeWidget = () => {
    widgetOptions.onClose()
    if (props.analytics) props.analytics.callTrack("backToWebsite")
  }

  if (isBroadcasting) {
    return (
      <div className={addPrefixClass("transaction-loading-container")}>
        <div className={addPrefixClass("transaction-loading")}>
          <div className={addPrefixClass("k-container")}>
            <div className={addPrefixClass("k-title")}>
              {broadcastError  &&
              <div>
                <div className={addPrefixClass("icon icon--failed")}></div>
                <div className={addPrefixClass("title-status")}>{ props.translate('transaction.failed') || "Failed!" }</div>
              </div>
              }
              {!broadcastError &&
              <div>
                <div className={addPrefixClass("icon icon--broadcasted")}></div>
                <div className={addPrefixClass("title-status")}>{ props.translate('transaction.broadcasting') || "Broadcasting!" }</div>
              </div>
              }
            </div>
            <div className={addPrefixClass("content with-overlap tx-loading")}>
              <ul className={addPrefixClass("broadcast-steps")}>
                {!broadcastError &&
                <li className={addPrefixClass("pending")}>
                  <h4 className={addPrefixClass("font-w-b")}>{props.translate("transaction.broadcasting_blockchain") || "Broadcasting the transaction to the blockchain"}
                  </h4>
                </li>
                }
                {broadcastError &&
                <li className={addPrefixClass("failed")}>
                  <h4 className={addPrefixClass("font-w-b")}>{props.translate("transaction.cound_not_broadcast") || "Couldn't broadcast your transaction to the blockchain"}</h4>
                  <div className={addPrefixClass("reason")}>{broadcastError}</div>
                </li>
                }
              </ul>
            </div>
          </div>

          <div className={addPrefixClass("k-container transaction-loading__button-container")}>
            <div className={addPrefixClass("payment-gateway__hollow-button final-step-payment")} onClick={(e) => closeWidget()}>
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
    <div className={addPrefixClass("transaction-loading-container")}>
      <div className={addPrefixClass("transaction-loading")}>
        <div className={addPrefixClass("k-container")}>
          <div className={addPrefixClass("k-title")}>
            <div>
              <div className={addPrefixClass("icon icon--broadcasted")}></div>
              <div className={addPrefixClass("k-title")}>{ props.translate('transaction.broadcasted') || "Broadcasted!" }</div>
            </div>
          </div>
          <div className={addPrefixClass("content with-overlap")}>
            <div className={addPrefixClass("info tx-title")}>
              <div className={addPrefixClass("tx-title-text")}>{props.translate("transaction.transaction") || "Transaction hash"}</div>
              <div className={addPrefixClass("tx-hash")}>
                <a className={addPrefixClass("text-light")} href={BLOCKCHAIN_INFO[props.network].ethScanUrl + 'tx/' + props.txHash} target="_blank"
                   title={props.translate("modal.view_on_etherscan") || "View on Etherscan"} onClick={(e) => props.analytics.callTrack("viewTxOnEtherscan")}>
                  {props.txHash}
                </a>
                <a className={addPrefixClass("copy-tx")} data-for='copy-tx-tip' data-tip=""
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

        <div className={addPrefixClass("k-container transaction-loading__button-container")}>
          <div className={addPrefixClass("payment-gateway__hollow-button final-step-payment")} onClick={(e) => closeWidget()}>
          {props.translate("transaction.back_to_website") || "Back to Website"}
        </div>
        </div>
      </div>
    </div>
  )
};

export default TransactionLoadingView
