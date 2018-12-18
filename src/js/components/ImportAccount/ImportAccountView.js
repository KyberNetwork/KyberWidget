import React from "react";
import ImportByPKeyView from "./PrivateKey/ImportByPKeyView";
import ImportByLedgerView from "./Ledger/ImportByLedgerView";
import ImportByTrezorView from "./Trezor/ImportByTrezorView";
import ImportByKeystoreView from "./Keystore/ImportByKeystoreView";
import { ImportByMetamask } from "../../containers/ImportAccount";
import {
  ImportByPrivateKey,
  ImportByDeviceWithLedger,
  ImportByDeviceWithTrezor,
  ImportKeystore,
} from "../../containers/ImportAccount";
import SignerAddress from "./SignerAddress";
import constants from "../../services/constants";
import {addPrefixClass} from "../../utils/className"

const ImportAccountView = (props) => {
  let importComponent = "";
  let handleImportWallet = false;

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
            <div className={addPrefixClass("widget-exchange__text theme-text")}>Unlock your Wallet</div>

            {props.signerAddresses.length !== 0 && (
              <SignerAddress signerAddresses={props.signerAddresses}/>
            )}

            <div className={addPrefixClass("import-account")}>
              <ImportByMetamask screen={props.screen}/>
              <ImportByLedgerView onOpenImportAccount={props.onOpenImportAccount} translate={props.translate}/>
              <ImportByTrezorView onOpenImportAccount={props.onOpenImportAccount} translate={props.translate}/>
              <ImportKeystore onOpenImportAccount={props.onOpenImportAccount} screen={props.screen} translate={props.translate}/>
              <ImportByPKeyView onOpenImportAccount={props.onOpenImportAccount} translate={props.translate}/>
            </div>

            <div className={addPrefixClass("import-account-content " + (props.chosenImportAccount && props.isLoading === false ? 'import-account-content--active' : ''))}>
              {importComponent}
            </div>
          </div>
          <div className={addPrefixClass("widget-exchange__column-item")}>
            {props.detailBox}
          </div>
        </div>
      </div>
      <div className={addPrefixClass("widget-exchange__bot common__flexbox between")}>
        <div
          className={addPrefixClass("common__button hollow theme-button")}
          onClick={props.chosenImportAccount ? props.onCloseImportAccount : props.backToFirstStep}
        >
          {props.translate("transaction.back") || "Back"}
        </div>

        {props.chosenImportAccount && (
          <div className={addPrefixClass(`common__button theme-gradient ${props.error ? 'disabled' : ''}`)} onClick={handleImportWallet}>
            {props.translate("modal.import") || "Import"}
          </div>
        )}
      </div>
    </div>
  )
};

export default ImportAccountView;
