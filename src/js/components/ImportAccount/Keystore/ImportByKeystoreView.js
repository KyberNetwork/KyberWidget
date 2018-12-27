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
          <div className={addPrefixClass(`import-account-content__info-type theme-border ${props.error ? 'error' : ''}`)}>
            <div>
              <div className={addPrefixClass(`importer__icon keystore`)}/>
              <div className={addPrefixClass("import-account-content__info-type-text")}>
                {props.translate("import.json") || "JSON"}
              </div>
            </div>
          </div>
        </div>

        <div className={addPrefixClass("common__error box")}>{props.error}</div>
      </div>
    </div>
  )
};

export default ImportByKeystoreView;
