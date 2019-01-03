import React from "react";
import {addPrefixClass} from "../../../utils/className"

const ImportByPKeyContent = (props) => {
  return (
    <div>
      <div className={addPrefixClass("widget-exchange__text theme-text")}>
        {props.translate("import.from_private_key_input_title") || "Enter your Private Key"}
      </div>
      <div className={addPrefixClass("import-account-content__wrapper")}>
        <div className={addPrefixClass("common__input-panel")}>
          <input
            className={addPrefixClass(`common__input theme-border`)}
            id="private_key"
            type={props.showPassword ? "text" : "password"}
            onChange={(e) => props.onChange(e)}
            value={props.privateKey}
            autoFocus
            autoComplete="off"
            spellCheck="false"
            onFocus={(e) => {props.analytics.callTrack("clickFocusToInputPrivateKey")}}
            required
          />
          <div className={addPrefixClass("common__input-panel-label small")}>
            <div className={addPrefixClass(`import-account__eye-icon ${props.showPassword ? "unlock" : ""}`)} onClick={props.onToggleShowPw}/>
          </div>
        </div>

        {!!props.pKeyError &&
          <div className={addPrefixClass("common__error box")}>{props.pKeyError}</div>
        }
      </div>
    </div>
  )
};

export default ImportByPKeyContent;
