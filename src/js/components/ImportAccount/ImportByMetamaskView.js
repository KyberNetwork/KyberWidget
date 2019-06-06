import React from "react"
import { addPrefixClass } from "../../utils/className";

const ImportByMetamaskView = (props) => {
  return (
    <div className={addPrefixClass("import-account__item theme-icon-hover")} onClick={(e) => props.connect(e)}>
      <div className={addPrefixClass("column column-block")}>
        <div className={addPrefixClass("importer metamask")}>
          <div className={addPrefixClass("importer__symbol")}>
            <div className={addPrefixClass("importer__icon metamask")}/>
            <div className={addPrefixClass("importer__name")}>Metamask</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportByMetamaskView
