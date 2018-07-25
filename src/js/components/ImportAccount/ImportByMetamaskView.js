import React from "react"

const ImportByMetamaskView = (props) => {
  return (
    <div className="import-account__item" onClick={(e) => props.connect(e)}>
      <div className="column column-block">
        <div className="importer metamask">
          <div className="importer__symbol">
            <img src={require('../../../assets/img/landing/metamask_disable.png')} />
            <div className="importer__name">{props.translate("import.from_metamask") || "METAMASK"}</div>
          </div>

          <div className="more-info">
            {props.metamask.error !== "" && (
              <div className="error">{props.metamask.error}</div>
            )}

            {props.metamask.error === "" && (
              <div className="info">
                <div className="address">
                  <div>{props.translate("import.metamask_address") || "Metamask Address"}:</div>
                  <div>{props.metamask.address.slice(0, 8)}...{props.metamask.address.slice(-6)}</div>
                </div>
                <div className="importer__balance">
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
