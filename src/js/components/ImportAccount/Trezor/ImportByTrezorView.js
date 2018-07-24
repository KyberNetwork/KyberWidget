import React from "react";
import Constants from '../../../constants';

const ImportByTrezorView = (props) => {
  return (
    <div className="column">
      <div class="importer trezor">
        <div className="importer__symbol">
          <img src={require('../../../../assets/img/landing/trezor_active.svg')} />
          <div className="importer__name">{props.translate("import.from_trezor") || "TREZOR"}</div>
        </div>
        <button className="importer__button" onClick={(e) => props.onOpenImportAccount(Constants.IMPORT_TREZOR_TYPE)}>
          {props.translate("import.swap_from_trezor") || "Swap from Trezor"}
        </button>
      </div>
    </div>
  )
};

export default ImportByTrezorView;
