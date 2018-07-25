import React from "react";
import ImportByPKeyView from "./PrivateKey/ImportByPKeyView";
import ImportByLedgerView from "./Ledger/ImportByLedgerView";
import ImportByTrezorView from "./Trezor/ImportByTrezorView";
import {
  ImportByPrivateKey,
  ImportByDeviceWithLedger,
  ImportByDeviceWithTrezor,
} from "../../containers/ImportAccount";
import SignerAddress from './SignerAddress';
import constants from '../../services/constants';

const ImportAccountView = (props) => {
  let importComponent = '';

  switch (props.choosenImportAccount) {
    case constants.IMPORT_ACCOUNT_TYPE.privateKey:
      importComponent = <ImportByPrivateKey onCloseImportAccount={props.onCloseImportAccount}/>
      break;
    case constants.IMPORT_ACCOUNT_TYPE.ledger:
      importComponent = <ImportByDeviceWithLedger onCloseImportAccount={props.onCloseImportAccount} screen={props.screen}/>;
      break;
    case constants.IMPORT_ACCOUNT_TYPE.trezor:
      importComponent = <ImportByDeviceWithTrezor onCloseImportAccount={props.onCloseImportAccount} screen={props.screen}/>;
      break;
  }

  return (
    <div id="import-account">
      <div className="container">
        <div className="payment-gateway__step-title payment-gateway__step-title--2">
          {props.translate("address.import_address") || "Import Address"}
        </div>

        {props.signerAddresses.length !== 0 &&
          <SignerAddress signerAddresses={props.signerAddresses}/>
        }

        <div className={"import-account"}>
          {props.firstKey}
          <ImportByTrezorView translate={props.translate} onOpenImportAccount={props.onOpenImportAccount}/>
          {props.secondKey}
          <ImportByPKeyView translate={props.translate} onOpenImportAccount={props.onOpenImportAccount}/>
          <ImportByLedgerView translate={props.translate} onOpenImportAccount={props.onOpenImportAccount}/>
        </div>

        <div className={"import-account-content " + (props.choosenImportAccount && props.isLoading === false ? 'import-account-content--active' : '')}>
          {importComponent}
        </div>
      </div>
    </div>
  )
};

export default ImportAccountView;
