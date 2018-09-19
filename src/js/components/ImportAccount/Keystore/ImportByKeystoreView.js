import React from "react";
import { addPrefixClass } from "../../../utils/className";

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
                src={require('../../../../assets/img/landing/keystore_active.svg')}/>
            <div className={addPrefixClass("import-account-content__info-type-text")}>
              {props.translate("import.json") || "JSON"}
            </div>
          </div>
        </div>

        <div className={addPrefixClass("import-account-content__error")}>{props.error}</div>

        <div className={addPrefixClass("import-account-content__button-container")}>
          <div className={addPrefixClass("import-account-content__button payment-gateway__button--back")} onClick={props.onCloseImportAccount}>
            {props.translate("transaction.back") || "Back"}
          </div>
        </div>
      </div>
    </div>
  )
};

export default ImportByKeystoreView;
