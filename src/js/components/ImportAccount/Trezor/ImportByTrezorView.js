import React from "react";
import constants from '../../../services/constants';

const ImportByTrezorView = (props) => {
  return (
    <div className="import-account__item" onClick={() => props.onOpenImportAccount(constants.IMPORT_ACCOUNT_TYPE.trezor)}>
      <div className="column">
        <div class="importer trezor">
          <div className="importer__symbol">
            <img src={require('../../../../assets/img/landing/trezor_disable.png')} />
            <div className="importer__name">{props.translate("import.from_trezor") || "TREZOR"}</div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ImportByTrezorView;
