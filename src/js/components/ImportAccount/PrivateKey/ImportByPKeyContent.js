import React from "react";

const ImportByPKeyContent = (props) => {
  return (
    <div>
      <div className="payment-gateway__step-title payment-gateway__step-title--2">
        {props.translate("import.from_private_key_input_title") || "Enter your Private Key"}
      </div>
      <div className="import-account-content__wrapper">
        <div className={"import-account-content__info"}>
          <div className={"import-account-content__info-type"}>
            <img
                className={"import-account-content__info-type-image"}
                src={require('../../../../assets/img/landing/privatekey_active.svg')}/>
            <div className={"import-account-content__info-type-text"}>
              {props.translate("import.from_private_key") || "PRIVATE KEY"}
            </div>
          </div>
        </div>

        <div className="import-account-content__private-key">
          <input
              className="import-account-content__private-key-input security"
              id="private_key"
              type="text"
              onChange={(e) => props.onChange(e)}
              onKeyPress={(e) => props.onSubmit(e)}
              value={props.privateKey}
              autoFocus
              autoComplete="off"
              spellCheck="false"
              onFocus={(e) => {props.analytics.callTrack("clickFocusToInputPrivateKey")}}
              required />
          <div>{props.privateKeyVisible}</div>
          <div className="import-account-content__private-key-toggle" onClick={props.onToggleShowPw}></div>
          <div className="import-account-content__private-key-icon"></div>
        </div>

        {!!props.pKeyError &&
        <div className="import-account-content__error">{props.pKeyError}</div>
        }

        <div className={"import-account-content__button-container"}>
          <div className={"import-account-content__button payment-gateway__button--back"} onClick={props.onCloseImportAccount}>
            {props.translate("transaction.back") || "Back"}
          </div>
          <div className={"import-account-content__button payment-gateway__button"} id="submit_pkey" onClick={props.onHandleSubmit}>
            {props.translate("modal.import") || "Import"}
          </div>
        </div>
      </div>
    </div>
  )
};

export default ImportByPKeyContent;
