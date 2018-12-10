import React from "react"

import Dropzone from 'react-dropzone'
import {addPrefixClass} from "../../utils/className"

const DropFile = (props)=> {
  var keystring
  var message
  try {
    if(props.keystring){
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
        <i class={addPrefixClass("k-icon k-icon-cloud")}></i>
      </p>
    }
  }

  return (
    <Dropzone onDrop={props.onDrop}>
      {message}
    </Dropzone>)  
}

export default DropFile
