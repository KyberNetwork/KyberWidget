import React from "react";
import constants from '../../../services/constants';
import {addPrefixClass} from "../../../utils/className"

const ImportByTrezorView = (props) => {
  return (
    <div className={addPrefixClass("import-account__item")} onClick={() => props.onOpenImportAccount(constants.IMPORT_ACCOUNT_TYPE.trezor)}>
      <div className={addPrefixClass("column")}>
        <div className={addPrefixClass("importer trezor")}>
          <div className={addPrefixClass("importer__symbol")}>
            {/* <img src={require('../../../../assets/img/landing/trezor_disable.png')} /> */}
            <div className={addPrefixClass("importer__icon")}></div>
            <div className={addPrefixClass("importer__name")}>{props.translate("import.from_trezor") || "TREZOR"}</div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ImportByTrezorView;
