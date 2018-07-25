import React from "react";
import constants from '../../../services/constants';

const ImportByLedgerView = (props) => {
  return (
    <div className="import-account__item" onClick={() => props.onOpenImportAccount(constants.IMPORT_ACCOUNT_TYPE.ledger)}>
      <div className="column">
        <div className="importer ledger">
          <div className="importer__symbol">
            <img src={require('../../../../assets/img/landing/ledger_disable.png')} />
            <div className="importer__name">{props.translate("import.from_ledger") || "LEDGER"}</div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ImportByLedgerView;
