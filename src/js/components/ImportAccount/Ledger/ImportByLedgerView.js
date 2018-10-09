import React from "react";
import constants from '../../../services/constants';
import {addPrefixClass} from "../../../utils/className"
import { getAssetUrl } from "../../../utils/common";

const ImportByLedgerView = (props) => {
  return (
    <div className={addPrefixClass("import-account__item")} onClick={() => props.onOpenImportAccount(constants.IMPORT_ACCOUNT_TYPE.ledger)}>
      <div className={addPrefixClass("column")}>
        <div className={addPrefixClass("importer ledger")}>
          <div className={addPrefixClass("importer__symbol")}>
            {/* <img src={require('../../../../assets/img/landing/ledger_disable.png')} /> */}
            <div className={addPrefixClass("importer__icon")} style={{backgroundImage: "url(" + getAssetUrl(`DesignAssets/wallets/ledger.svg`) + ")"}}></div>
            <div className={addPrefixClass("importer__name")}>{props.translate("import.from_ledger") || "LEDGER"}</div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ImportByLedgerView;
