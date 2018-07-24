import React from "react";
import ImportByPKeyView from "./PrivateKey/ImportByPKeyView";
import ImportByLedgerView from "./Ledger/ImportByLedgerView";
import ImportByTrezorView from "./Trezor/ImportByTrezorView";
import {
  ImportByPrivateKey,
  ImportByDeviceWithLedger,
  ImportByDeviceWithTrezor
} from "../../containers/ImportAccount";
import Constants from '../../constants';

const ImportAccountView = (props) => {
  let importComponent = '';

  switch (props.choosenImportAccount) {
    case Constants.IMPORT_PRIVATE_KEY_TYPE:
      importComponent = <ImportByPrivateKey onCloseImportAccount={props.onCloseImportAccount}/>
      break;
    case Constants.IMPORT_LEDGER_TYPE:
      importComponent = <ImportByDeviceWithLedger onCloseImportAccount={props.onCloseImportAccount} screen={props.screen}/>;
      break;
    case Constants.IMPORT_TREZOR_TYPE:
      importComponent = <ImportByDeviceWithTrezor onCloseImportAccount={props.onCloseImportAccount} screen={props.screen}/>;
      break;
  }

  return (
    <div id="import-account">
      <div className="landing-background"></div>
      <div className="frame">
        <div className="container">
          <div className="small-centered" id="import-acc">
            <h1 className="title">{props.translate("address.import_address") || "Import address"}</h1>

            <div className={"import-account"}>
              <div className="import-account__item">
                {props.firstKey}
              </div>
              <div className="import-account__item">
                {props.secondKey}
              </div>
              <div className="import-account__item">
                <ImportByTrezorView
                  translate={props.translate}
                  onOpenImportAccount={props.onOpenImportAccount}
                />
              </div>
              <div className="import-account__item">
                <ImportByLedgerView
                  translate={props.translate}
                  onOpenImportAccount={props.onOpenImportAccount}
                />
              </div>
              <div className="import-account__item">
                <ImportByPKeyView
                  translate={props.translate}
                  onOpenImportAccount={props.onOpenImportAccount}
                />
              </div>
            </div>

            <div className={"import-account-content " + (props.choosenImportAccount && props.isLoading === false ? 'import-account-content--active' : '')}>
              {importComponent}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ImportAccountView;
