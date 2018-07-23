import React from "react";

const ImportByPKeyView = (props) => {
  const type = 'private-key';

  return (
    <div className="column">
      <div className="importer pkey">
        <div className="importer__symbol">
          <img src={require('../../../../assets/img/landing/privatekey_active.svg')} />
          <div className="importer__name">{props.translate("import.from_private_key") || "PRIVATE KEY"}</div>
        </div>
        <button
            className="importer__button"
            onClick={(e) => props.onOpenImportAccount(type)}>
          {props.translate("import.from_private_key_input_title_placehoder") || "Enter your Private key"}
        </button>
      </div>
    </div>
  )
};

export default ImportByPKeyView;
