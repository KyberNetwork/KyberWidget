import React from "react"
import BLOCKCHAIN_INFO from "../../../../env"
import ReactTooltip from 'react-tooltip'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import {addPrefixClass} from "../../utils/className"
import * as widgetOptions from "../../utils/widget-options"

const TransactionLoadingView = (props) => {
  const isBroadcasting = props.broadcasting;
  const broadcastError = props.error;

  const closeWidget = () => {
    widgetOptions.onClose()
    if (props.analytics) props.analytics.callTrack("backToWebsite")
  }

  const getTooltipCopy = () => {
    return props.isCopied ?
      (props.translate("transaction.copied") || "Copied!") :
      (props.translate("transaction.copy_tx") || "Copy transaction hash")
  }

  if (isBroadcasting) {
    return (
      <div className={addPrefixClass("broadcast")}>
        {broadcastError  &&
        <div className={addPrefixClass("broadcast__header")}>
          <div className={addPrefixClass("broadcast__icon failed")}/>
          <div className={addPrefixClass("broadcast__title")}>{ props.translate('transaction.failed') || "Failed!" }</div>
        </div>
        }

        {!broadcastError &&
        <div className={addPrefixClass("broadcast__header")}>
          <div className={addPrefixClass("broadcast__icon broadcast")}/>
          <div className={addPrefixClass("broadcast__title")}>{ props.translate('transaction.broadcasting') || "Broadcasting" }</div>
        </div>
        }

        <div className={addPrefixClass("broadcast__body")}>
          <div className={addPrefixClass("broadcast__body-item theme-border")}>
            {!broadcastError &&
              <div className={addPrefixClass("broadcast__content")}>
                <img src={require("../../../assets/img/icons/icon-loading-circle.gif")} />
                <div className={addPrefixClass("broadcast__text-light")}>{props.translate("transaction.broadcasting_blockchain") || "Waiting for the transaction to be mined"}</div>
              </div>
            }
            {broadcastError &&
            <div>
              <div className={addPrefixClass("common__error")}>{props.translate("transaction.cound_not_broadcast") || "Couldn't broadcast your transaction to the blockchain"}</div>
              <div className={addPrefixClass("common__error box")}>{broadcastError}</div>
            </div>
            }
          </div>
        </div>

        <div className={addPrefixClass("widget-exchange__bot common__flexbox center")}>
          <div className={addPrefixClass("common__button hollow small theme-button")} onClick={(e) => closeWidget()}>
            {props.translate("transaction.back_to_website") || "Back to Website"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={addPrefixClass("broadcast")}>
      <div className={addPrefixClass("broadcast__header")}>
        <div className={addPrefixClass("broadcast__icon broadcast")}/>
        <div className={addPrefixClass("broadcast__title")}>{ props.translate('transaction.broadcasted') || "Broadcasted!" }</div>
      </div>

      <div className={addPrefixClass("broadcast__body")}>
        <div className={addPrefixClass("broadcast__body-item")}>
          <div className={addPrefixClass("broadcast__text")}>{props.translate("transaction.transaction") || "Transaction hash"}:</div>

          <div className={addPrefixClass("broadcast__content")}>
            <a className={addPrefixClass("broadcast__text-bold link theme-text-hover")} href={BLOCKCHAIN_INFO[props.network].ethScanUrl + 'tx/' + props.txHash} target="_blank"
               title={props.translate("modal.view_on_etherscan") || "View on Etherscan"} onClick={(e) => props.analytics.callTrack("viewTxOnEtherscan")}>
              {props.txHash}
            </a>
            <a className={addPrefixClass("broadcast__copy")} data-for='copy-tx-tip' data-tip=""
               onClick={props.handleCopy}
               onMouseLeave={props.resetCopy} >
              <CopyToClipboard text={props.txHash}>
                <img src={require("../../../assets/img/icons/icon-copy.svg")} />
              </CopyToClipboard>
            </a>
            <ReactTooltip getContent={[() => getTooltipCopy()]} place="right" id="copy-tx-tip" type="light" />
          </div>
        </div>
      </div>

      <div className={addPrefixClass("widget-exchange__bot common__flexbox center")}>
        <div className={addPrefixClass("common__button hollow small theme-button")} onClick={(e) => closeWidget()}>
          {props.translate("transaction.back_to_website") || "Back to Website"}
        </div>
      </div>
    </div>
  )
};

export default TransactionLoadingView
