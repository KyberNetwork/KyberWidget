import React from "react";
import Constants from '../../../constants';

const ImportByLedgerView = (props) => {
  return (
    <div className="column">
      <div className="importer ledger">
        <div className="importer__symbol">
          <img src={require('../../../../assets/img/landing/ledger_active.svg')} />
          <div className="importer__name">{props.translate("import.from_ledger") || "LEDGER"}</div>
        </div>
        <button className="importer__button" onClick={(e) => props.onOpenImportAccount(Constants.IMPORT_LEDGER_TYPE)}>
          {props.translate("import.swap_from_ledger") || "Swap from Ledger"}
        </button>
      </div>
    </div>
  )
};

export default ImportByLedgerView;
