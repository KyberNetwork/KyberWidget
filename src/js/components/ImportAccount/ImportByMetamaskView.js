import React from "react"
import {addPrefixClass} from "../../utils/className"

const ImportByMetamaskView = (props) => {
  return (
    <div className={addPrefixClass("import-account__item")} onClick={(e) => props.connect(e)}>
      <div className={addPrefixClass("column column-block")}>
        <div className={addPrefixClass("importer metamask")}>
          <div className={addPrefixClass("importer__symbol")}>
            {/* <img src={require('../../../assets/img/landing/metamask_disable.png')} /> */}
            <div className={addPrefixClass("importer__icon")}></div>
            <div className={addPrefixClass("importer__name")}>{props.translate("import.from_metamask") || "METAMASK"}</div>
          </div>

          <div className={addPrefixClass("more-info")}>
            {props.metamask.error !== "" && (
              <div className={addPrefixClass("error")}>{props.metamask.error}</div>
            )}

            {props.metamask.error === "" && (
              <div className={addPrefixClass("info")}>
                <div className={addPrefixClass("address")}>
                  <div>
                    {props.translate("import.address") || "Address"}: {props.metamask.address.slice(0, 8)}...{props.metamask.address.slice(-6)}
                  </div>
                </div>
                <div className={addPrefixClass("importer__balance payment-gateway__color")}>
                  {props.translate("import.balance") || "Balance"}: {props.metamask.balance} ETH
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportByMetamaskView
