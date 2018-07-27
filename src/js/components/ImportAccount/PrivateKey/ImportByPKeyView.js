import React from "react";
import constants from '../../../services/constants';

const ImportByPKeyView = (props) => {
  return (
    <div className="import-account__item" onClick={() => props.onOpenImportAccount(constants.IMPORT_ACCOUNT_TYPE.privateKey)}>
      <div className="column">
        <div className="importer pkey">
          <div className="importer__symbol">
            <img src={require('../../../../assets/img/landing/privatekey_disable.png')} />
            <div className="importer__name">{props.translate("import.from_private_key") || "PRIVATE KEY"}</div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ImportByPKeyView;
