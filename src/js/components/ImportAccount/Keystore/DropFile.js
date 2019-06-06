import React from "react"
import Dropzone from 'react-dropzone'
import { addPrefixClass } from "../../../utils/className"

const DropFile = (props) => {
  return (
    <div className={addPrefixClass("import-account__item theme-icon-hover")} onDrop={(e) => props.onDrop(e)} onClick={(e) => props.onDrop(e)}>
      <Dropzone onDrop={props.onDrop} disablePreview={true} className={addPrefixClass("column column-block import-account__json")}>
        {({getRootProps, getInputProps, isDragActive}) => {
          return (
            <div className={addPrefixClass("importer json")} {...getRootProps()}>
              <input {...getInputProps()} />
              <div className={addPrefixClass("importer__symbol")}>
                <div className={addPrefixClass("importer__icon keystore")}/>
                <div className={addPrefixClass("importer__name")}>{props.translate("import.keystore") || "Keystore"}</div>
              </div>
            </div>
          )
        }}
      </Dropzone>
    </div>
  )  
};

export default DropFile
