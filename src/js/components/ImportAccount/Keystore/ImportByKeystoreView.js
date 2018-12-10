import React from "react";
import { addPrefixClass } from "../../../utils/className";
import { getAssetUrl } from "../../../utils/common";

const ImportByKeystoreView = (props) => {
  return (
    <div>
      <div className={addPrefixClass("payment-gateway__step-title payment-gateway__step-title--2")}>
        {props.translate("import.from_json_title") || "Choose your JSON file"}
      </div>
      <div className={addPrefixClass("import-account-content__wrapper")}>
        <div className={addPrefixClass("import-account-content__info")}>
          <div className={addPrefixClass("import-account-content__info-type")}>
            <img
                className={addPrefixClass("import-account-content__info-type-image")}
                src={getAssetUrl(`wallets/keystore.svg`)}/>
            <div className={addPrefixClass("import-account-content__info-type-text")}>
              {props.translate("import.json") || "JSON"}
            </div>
          </div>
        </div>

        <div className={addPrefixClass("import-account-content__error")}>{props.error}</div>
      </div>
    </div>
  )
};

export default ImportByKeystoreView;
