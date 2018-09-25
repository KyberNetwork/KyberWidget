import React from "react"
import Dropzone from 'react-dropzone'

const DropFile = (props) => {
  var keystring
  var message
  try {
    if (props.keystring) {
      keystring = JSON.parse(props.keystring)
      message = <p className="file-name">
        Uploaded keystore file for address: <span>{keystring.address}</span>
        <i class="k-icon k-icon-cloud"></i>
      </p>
    }
  } catch (e) {
    console.log(e)
    if (props.error != "") {
      message = <p className="file-name">
        {props.error}
      </p>
    } else {
      message = <p className="file-name">
        Upload a valid keystore file
        <i class="k-icon k-icon-cloud"></i>
      </p>
    }
  }

  return (
    <div className="import-account__item" onDrop={(e) => props.onDrop(e)} onClick={(e) => props.onDrop(e)}>
      <Dropzone onDrop={(e) => props.onDrop(e)} disablePreview={true} className="column column-block import-account__json">
        <div className="importer json">
          <div className="importer__symbol">
            {/* <img src={require('../../../../assets/img/landing/keystore_disable.png')} /> */}
            <div className="importer__icon"></div>
            <div className="importer__name">{props.translate("import.json") || "JSON"}</div>
          </div>
        </div>
      </Dropzone>
    </div>
  )  
}

export default DropFile
