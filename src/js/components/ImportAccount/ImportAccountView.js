import React from "react";
import ImportByPKeyView from "./PrivateKey/ImportByPKeyView";
import { ImportByPrivateKey } from "../../containers/ImportAccount";

const ImportAccountView = (props) => {
  let choosenImportAccountComponent = '';

  switch (props.choosenImportAccount) {
    case 'private-key':
      choosenImportAccountComponent =
          <ImportByPrivateKey
              onCloseImportAccount={props.onCloseImportAccount}
          />
      break;
  }

  return (
    <div id="import-account">
      <div className="landing-background"></div>
      <div className="frame">
        <div className="container">
          <div className="small-centered" id="import-acc">
            <h1 className="title">{props.translate("address.import_address") || "Import address"}</h1>

            <div className={"import-account"}>
              <div className="import-account__item">
                {props.firstKey}
              </div>
              <div className="import-account__item">
                {props.secondKey}
              </div>
              <div className="import-account__item">
                {props.thirdKey}
              </div>
              <div className="import-account__item">
                {props.fourthKey}
              </div>
              <div className="import-account__item">
                <ImportByPKeyView
                  translate={props.translate}
                  onOpenImportAccount={props.onOpenImportAccount}
                />
              </div>
            </div>

            <div className={"import-account-content " + (props.choosenImportAccount ? 'import-account-content--active' : '')}>
              {choosenImportAccountComponent}
            </div>
          </div>
        </div>
        {props.errorModal}
      </div>
    </div>
  )
};

export default ImportAccountView;
