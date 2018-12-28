import React from "react";
import ImportByPKeyView from "./PrivateKey/ImportByPKeyView";
import ImportByLedgerView from "./Ledger/ImportByLedgerView";
import ImportByTrezorView from "./Trezor/ImportByTrezorView";
import ImportByKeystoreView from "./Keystore/ImportByKeystoreView";
import { ImportByMetamask } from "../../containers/ImportAccount";
import { ImportByPrivateKey, ImportByDeviceWithLedger, ImportByDeviceWithTrezor, ImportKeystore } from "../../containers/ImportAccount";
import constants from "../../services/constants";
import {addPrefixClass} from "../../utils/className"
import { isMobile } from '../../utils/common'

const ImportAccountView = (props) => {
  let importComponent = "";
  let handleImportWallet = false;
  const isOnMobile = isMobile.Android() || isMobile.iOS();

  switch (props.chosenImportAccount) {
    case constants.IMPORT_ACCOUNT_TYPE.keystore:
      importComponent = <ImportByKeystoreView translate={props.translate} error={props.error}/>
      break;
    case constants.IMPORT_ACCOUNT_TYPE.privateKey:
      importComponent = <ImportByPrivateKey/>;
      handleImportWallet = props.handleSubmitPrivateKey;
      break;
    case constants.IMPORT_ACCOUNT_TYPE.ledger:
      importComponent = <ImportByDeviceWithLedger screen={props.screen}/>;
      handleImportWallet = props.handleImportDevice;
      break;
    case constants.IMPORT_ACCOUNT_TYPE.trezor:
      importComponent = <ImportByDeviceWithTrezor screen={props.screen}/>;
      handleImportWallet = props.handleImportDevice;
      break;
  }

  return (
    <div className={addPrefixClass("widget-exchange")}>
      <div className={addPrefixClass("widget-exchange__body small-padding")}>
        <div className={addPrefixClass(`widget-exchange__column ${props.exchangeType}`)}>
          <div className={addPrefixClass("widget-exchange__column-item")}>
            {isOnMobile && (
              <div className={addPrefixClass("coinbase")}>
                <div className={addPrefixClass("coinbase__content")}>
                  <div className={addPrefixClass("coinbase__logo")}/>
                  <div>
                    <div className={addPrefixClass("coinbase__name")}>Coinbase Wallet</div>
                    <div className={addPrefixClass("coinbase__desc")}>Ethereum Wallet & DApp</div>
                  </div>
                </div>
                <a className={addPrefixClass("coinbase__download theme-text")} href={isMobile.iOS() ? "https://itunes.apple.com/us/app/coinbase-wallet/id1278383455?mt=8" : "https://play.google.com/store/apps/details?id=org.toshi&hl=en"} target="_blank">
                  Download
                </a>
              </div>
            )}

            <div className={addPrefixClass("widget-exchange__text theme-text")}>Unlock your Wallet</div>

            <div className={addPrefixClass("import-account-content " + (props.chosenImportAccount && props.isLoading === false ? 'import-account-content--active' : ''))}>
              {importComponent}
            </div>

            <div className={addPrefixClass("import-account")}>
              {!isOnMobile && (
                <ImportByMetamask screen={props.screen}/>
              )}

              {!isOnMobile && (
                <ImportByLedgerView onOpenImportAccount={props.onOpenImportAccount} translate={props.translate}/>
              )}

              {!isOnMobile && (
                <ImportByTrezorView onOpenImportAccount={props.onOpenImportAccount} translate={props.translate}/>
              )}

              <ImportKeystore onOpenImportAccount={props.onOpenImportAccount} screen={props.screen} translate={props.translate}/>
              <ImportByPKeyView onOpenImportAccount={props.onOpenImportAccount} translate={props.translate}/>
            </div>
          </div>
          <div className={addPrefixClass("widget-exchange__column-item")}>
            {props.detailBox}
          </div>
        </div>
      </div>
      <div className={addPrefixClass(`widget-exchange__bot common__flexbox between ${props.chosenImportAccount ? 'mobile-column-reverse' : ''}`)}>
        <div
          className={addPrefixClass("common__button hollow theme-button")}
          onClick={props.chosenImportAccount ? props.onCloseImportAccount : props.backToFirstStep}
        >
          {props.translate("transaction.back") || "Back"}
        </div>

        {props.chosenImportAccount && (
          <div className={addPrefixClass(`widget-exchange__import common__button theme-gradient ${props.error ? 'disabled' : ''}`)} onClick={handleImportWallet}>
            {props.translate("modal.import") || "Import"}
          </div>
        )}
      </div>
    </div>
  )
};

export default ImportAccountView;
