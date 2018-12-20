import React from "react";
import constants from '../../../services/constants';
import {addPrefixClass} from "../../../utils/className"
import { getAssetUrl } from "../../../utils/common";

const ImportByPKeyView = (props) => {
  return (
    <div className={addPrefixClass("import-account__item")} onClick={() => props.onOpenImportAccount(constants.IMPORT_ACCOUNT_TYPE.privateKey)}>
      <div className={addPrefixClass("column")}>
        <div className={addPrefixClass("importer pkey")}>
          <div className={addPrefixClass("importer__symbol")}>
            <div className={addPrefixClass("importer__icon")} style={{backgroundImage: "url(" + getAssetUrl(`wallets/privatekey.svg`) + ")"}}></div>
            <div className={addPrefixClass("importer__name")}>{props.translate("import.from_private_key") || "PRIVATE KEY"}</div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ImportByPKeyView;
