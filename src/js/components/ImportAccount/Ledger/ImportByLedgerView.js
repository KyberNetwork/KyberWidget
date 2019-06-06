import React from "react";
import constants from '../../../services/constants';
import { addPrefixClass } from "../../../utils/className"

const ImportByLedgerView = (props) => {
  return (
    <div className={addPrefixClass("import-account__item theme-icon-hover")} onClick={() => props.onOpenImportAccount(constants.IMPORT_ACCOUNT_TYPE.ledger)}>
      <div className={addPrefixClass("column")}>
        <div className={addPrefixClass("importer ledger")}>
          <div className={addPrefixClass("importer__symbol")}>
            <div className={addPrefixClass("importer__icon ledger")}/>
            <div className={addPrefixClass("importer__name")}>Ledger</div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ImportByLedgerView;
