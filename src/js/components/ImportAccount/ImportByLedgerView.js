import React from "react"

const ImportByLedgerView = (props) => {
  return (
    <div>
      <div className="importer ledger">
        <div className="importer__symbol">
          <img src={require('../../../assets/img/landing/ledger_active.svg')} />
          <div className="importer__name">{props.translate("import.from_ledger") || "LEDGER"}</div>
        </div>
        <button className="importer__button" onClick={(e) => props.showLoading('ledger')}>
          {props.translate("import.swap_from_ledger") || "Swap from Ledger"}
        </button>
      </div>
    </div>
  )
}

export default ImportByLedgerView
