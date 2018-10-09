import React from "react"
import Dropzone from 'react-dropzone'
import {addPrefixClass} from "../../../utils/className"
import { getAssetUrl } from "../../../utils/common";

const DropFile = (props) => {
  var keystring
  var message
  try {
    if (props.keystring) {
      keystring = JSON.parse(props.keystring)
      message = <p className={addPrefixClass("file-name")}>
        Uploaded keystore file for address: <span>{keystring.address}</span>
        <i class={addPrefixClass("k-icon k-icon-cloud")}></i>
      </p>
    }
  } catch (e) {
    console.log(e)
    if (props.error != "") {
      message = <p className={addPrefixClass("file-name")}>
        {props.error}
      </p>
    } else {
      message = <p className={addPrefixClass("file-name")}>
        Upload a valid keystore file
        <i className={addPrefixClass("k-icon k-icon-cloud")}></i>
      </p>
    }
  }

  return (
    <div className={addPrefixClass("import-account__item")} onDrop={(e) => props.onDrop(e)} onClick={(e) => props.onDrop(e)}>
      <Dropzone onDrop={(e) => props.onDrop(e)} disablePreview={true} className={addPrefixClass("column column-block import-account__json")}>
        <div className={addPrefixClass("importer json")}>
          <div className={addPrefixClass("importer__symbol")}>
            {/* <img src={require('../../../../assets/img/landing/keystore_disable.png')} /> */}
            <div className={addPrefixClass("importer__icon")} style={{backgroundImage: 'url(' + getAssetUrl(`DesignAssets/wallets/keystore.svg`) + ')'}}></div>
            <div className={addPrefixClass("importer__name")}>{props.translate("import.json") || "JSON"}</div>
          </div>
        </div>
      </Dropzone>
    </div>
  )  
}

export default DropFile
