import React from "react"
import { connect } from "react-redux"
import { getTranslate } from 'react-localize-redux'
import * as converter from "../../utils/converter"
import * as validators from "../../utils/validators"
import * as exchangeActions from "../../actions/exchangeActions"
import * as transferActions from "../../actions/transferActions"
import * as accountActions from "../../actions/accountActions"
import { KeyStore, Trezor, Ledger, PrivateKey, Metamask } from "../../services/keys"
import {addPrefixClass} from "../../utils/className"

function getKeyService(type) {
  var keyService
  switch (type) {
    case "keystore":
      keyService = new KeyStore()
      break
    case "privateKey":
      keyService = new PrivateKey()
      break
    case "trezor":
      keyService = new Trezor()
      break
    case "ledger":
      keyService = new Ledger()
      break
    case "metamask":
      keyService = new Metamask()
      break
    default:
      keyService = new KeyStore()
      break
  }
  return keyService
}

@connect((store, props) => {
  const account = store.account.account
  const translate = getTranslate(store.locale)
  const tokens = store.tokens.tokens
  const exchange = store.exchange
  const transfer = store.transfer
  const snapshot = store.exchange.snapshot
  const ethereum = store.connection.ethereum
  const keyService = getKeyService(account.type)
  const global = store.global

  return {
    translate, exchange, transfer, tokens, account, ethereum, keyService, snapshot, global
  }
})


export default class Payment extends React.Component {
  constructor() {
    super()
    this.state = {
      showPassword: false,
    }
  }

  reImportAccount = () => {
    this.props.dispatch(exchangeActions.goToStep(2, 3))
    this.props.global.analytics.callTrack("clickToBack", 2)

    this.props.dispatch(accountActions.clearWatchMetamask())
  }

  approveToken = () => {
    var params
    if (this.props.exchange.isHaveDestAmount) {
      params = this.formParamOfSnapshotMaxDest()
    } else {
      params = this.formParamOfSnapshot()
    }

    const account = this.props.account
    const ethereum = this.props.ethereum
    this.props.dispatch(exchangeActions.doApprove(ethereum, params.sourceToken, params.sourceAmount, params.nonce, params.gas_approve, params.gasPrice,
      account.keystring, account.password, account.type, account, this.props.keyService, params.sourceTokenSymbol))
    this.props.global.analytics.callTrack("clickToApprove", params.sourceTokenSymbol)
  }

  processTransferTx = () => {
    try {
      var password = ""

      if (this.props.account.type === "keystore") {
        password = document.getElementById("passphrase").value
        document.getElementById("passphrase").value = ''
      }

      var account = this.props.account
      var nonce = validators.verifyNonce(this.props.account.getUsableNonce())
      var ethereum = this.props.ethereum
      var formId = "transfer"
      var data = ""
      var token = this.props.exchange.destTokenSymbol
      var tokenAddress = this.props.tokens[token].address
      var tokenDecimal = this.props.tokens[token].decimals
      var tokenName = this.props.tokens[token].tokenName
      var amount

      if (this.props.exchange.isHaveDestAmount) {
        amount = converter.stringToHex(this.props.exchange.destAmount, tokenDecimal)
      } else {
        amount = converter.stringToHex(this.props.exchange.sourceAmount, tokenDecimal)
      }

      var destAddress = this.props.exchange.receiveAddr
      var gas = converter.numberToHex(this.props.exchange.gas)
      var gasPrice = converter.numberToHex(converter.gweiToWei(this.props.exchange.gasPrice))
      var commissionID = this.props.exchange.commissionID
      var paymentData = this.props.exchange.paymentData
      var hint = this.props.exchange.hint
      var balanceData = {
        name: tokenName,
        decimals: tokenDecimal,
        tokenSymbol: token,
        amount: this.props.destAmount
      }

      this.props.dispatch(transferActions.processTransfer(formId, ethereum, account.address, tokenAddress, amount,
        destAddress, nonce, gas, gasPrice, account.keystring, account.type, password, account, data,
        this.props.keyService, balanceData, commissionID, paymentData, hint))
    } catch (e) {
      console.log(e)
    }
  }

  getSourceAmount = () => {
    var minConversionRate = converter.toTWei(this.props.snapshot.minConversionRate)
    var sourceAmount = converter.caculateSourceAmount(this.props.snapshot.destAmount, minConversionRate, 6)

    return converter.stringToHex(sourceAmount, this.props.snapshot.sourceDecimal)
  }

  formParamOfSnapshot = () => {
    var selectedAccount = this.props.account.address
    var sourceToken = this.props.snapshot.sourceToken
    var sourceAmount = converter.stringToHex(this.props.snapshot.sourceAmount, this.props.snapshot.sourceDecimal)
    var destToken = this.props.snapshot.destToken
    var minConversionRate = converter.toTWei(this.props.snapshot.minConversionRate)
    var blockNo
    var destAddress

    minConversionRate = converter.numberToHex(minConversionRate)

    if (this.props.exchange.commissionID) {
      blockNo = this.props.exchange.commissionID
    } else {
      blockNo = converter.numberToHexAddress(this.props.snapshot.blockNo)
    }

    if (this.props.exchange.isSwap) {
      destAddress = this.props.account.address
    } else {
      destAddress = this.props.exchange.receiveAddr
    }

    var maxDestAmount = converter.biggestNumber()
    var throwOnFailure = this.props.snapshot.throwOnFailure
    var nonce = validators.verifyNonce(this.props.account.getUsableNonce())
    var gas = converter.numberToHex(this.props.snapshot.gas)
    var gas_approve = converter.numberToHex(this.props.snapshot.gas_approve)
    var gasPrice = converter.numberToHex(converter.gweiToWei(this.props.snapshot.gasPrice))
    var sourceTokenSymbol = this.props.snapshot.sourceTokenSymbol
    var balanceData = {
      sourceName: this.props.snapshot.sourceName,
      sourceSymbol: this.props.snapshot.sourceTokenSymbol,
      sourceDecimal: this.props.snapshot.sourceDecimal,
      destName: this.props.snapshot.destName,
      destDecimal: this.props.snapshot.destDecimal,
      destSymbol: this.props.snapshot.destTokenSymbol,
    }
    var paymentData = this.props.exchange.paymentData
    var hint = this.props.exchange.hint

    return {
      selectedAccount, sourceToken, sourceAmount, destToken, minConversionRate, destAddress, maxDestAmount,
      throwOnFailure, nonce, gas, gas_approve, gasPrice, balanceData, sourceTokenSymbol, blockNo, paymentData, hint
    }
  }

  formParamOfSnapshotMaxDest = () => {
    var selectedAccount = this.props.account.address
    var sourceToken = this.props.snapshot.sourceToken
    var sourceAmount = this.getSourceAmount()
    var destToken = this.props.snapshot.destToken
    var minConversionRate = converter.toTWei(this.props.snapshot.minConversionRate)
    var blockNo
    var destAddress

    minConversionRate = converter.numberToHex(minConversionRate)

    if (this.props.exchange.commissionID) {
      blockNo = this.props.exchange.commissionID
    } else {
      blockNo = converter.numberToHexAddress(this.props.snapshot.blockNo)
    }

    if (this.props.exchange.isSwap) {
      destAddress = this.props.account.address
    } else {
      destAddress = this.props.exchange.receiveAddr
    }

    var maxDestAmount = converter.stringToHex(this.props.snapshot.destAmount, this.props.snapshot.destDecimal)
    var throwOnFailure = this.props.snapshot.throwOnFailure
    var nonce = validators.verifyNonce(this.props.account.getUsableNonce())
    var gas = converter.numberToHex(this.props.snapshot.gas)
    var gas_approve = converter.numberToHex(this.props.snapshot.gas_approve)
    var gasPrice = converter.numberToHex(converter.gweiToWei(this.props.snapshot.gasPrice))
    var sourceTokenSymbol = this.props.snapshot.sourceTokenSymbol
    var balanceData = {
      sourceName: this.props.snapshot.sourceName,
      sourceSymbol: this.props.snapshot.sourceTokenSymbol,
      sourceDecimal: this.props.snapshot.sourceDecimal,
      destName: this.props.snapshot.destName,
      destDecimal: this.props.snapshot.destDecimal,
      destSymbol: this.props.snapshot.destTokenSymbol,
    }
    var paymentData = this.props.exchange.paymentData
    var hint = this.props.exchange.hint

    return {
      selectedAccount, sourceToken, sourceAmount, destToken, minConversionRate, destAddress, maxDestAmount,
      throwOnFailure, nonce, gas, gas_approve, gasPrice, balanceData, sourceTokenSymbol, blockNo, paymentData, hint
    }
  }

  processExchangeTx = () => {
    try {
      var password = ""
      if (this.props.account.type === "keystore") {
        password = document.getElementById("passphrase").value
        document.getElementById("passphrase").value = ''
      }

      var params
      if (this.props.exchange.isHaveDestAmount) {
        params = this.formParamOfSnapshotMaxDest()
      } else {
        params = this.formParamOfSnapshot()
      }

      //check nonce
      var account = this.props.account
      var ethereum = this.props.ethereum
      var formId = "exchange"
      var data = ""

      this.props.dispatch(exchangeActions.processExchange(
        formId, ethereum, account.address, params.sourceToken, params.sourceAmount, params.destToken, params.destAddress,
        params.maxDestAmount, params.minConversionRate, params.throwOnFailure, params.nonce, params.gas, params.gasPrice,
        account.keystring, account.type, password, account, data, this.props.keyService, params.balanceData,
        params.sourceTokenSymbol, params.blockNo, params.paymentData, params.hint
      ))
    } catch (e) {
      console.log(e)
    }
  }

  payment = () => {
    var sourceTokenSymbol = this.props.exchange.sourceTokenSymbol
    var destTokenSymbol = this.props.exchange.destTokenSymbol

    if (sourceTokenSymbol === destTokenSymbol) {
      this.processTransferTx("")
    } else {
      this.processExchangeTx()
    }
    this.props.global.analytics.callTrack("clickToConfirm", sourceTokenSymbol, destTokenSymbol)
  }

  getError = () => {
    let errors = this.props.exchange.errors;

    const errorItems = Object.keys(errors).map(key => {
      if (errors[key] && errors[key] !== "") {
        return <div key={key}>{this.props.translate(errors[key]) || errors[key]}</div>
      }

      return ""
    });

    return <div>{errorItems}</div>
  };

  getWalletType = () => {
    switch (this.props.account.type) {
      case "metamask":
        return "Metamask";
      case "keystore":
        return "Json";
      case "privateKey":
        return "Private key";
      case "trezor":
        return "Trezor";
      case "ledger":
        return "Ledger";
      default:
        return false;
    }
  };

  toogleShowPassword = () => {
    this.setState({showPassword : !this.state.showPassword})
    this.props.global.analytics.callTrack("clickShowPassword", this.state.showPassword ? "show" : "hide")
  }

  resetPasswordError = () => {
    this.props.dispatch(exchangeActions.throwPassphraseError(""))
    this.props.dispatch(transferActions.throwPassphraseError(""))
  }

  getDestPay = () => {
    if (this.props.exchange.isHaveDestAmount) {
      return this.props.exchange.destAmount
    } else {
      if (this.props.exchange.sourceTokenSymbol === this.props.exchange.destTokenSymbol) {
        return this.props.exchange.sourceAmount
      } else {
        return converter.calculateDest(this.props.exchange.sourceAmount, this.props.exchange.offeredRate, 6)
      }
    }
  }

  render() {
    var classDisable = ""
    if (!this.props.exchange.validateAccountComplete || this.props.exchange.isConfirming || this.props.exchange.isFetchingGas) {
      classDisable += " disabled"
    }

    var signExchangeError = this.props.exchange.signError ? this.props.exchange.signError : ""
    var broadcastExchangeError = this.props.exchange.broadcastError ? this.props.exchange.broadcastError : ""
    var txError = signExchangeError + broadcastExchangeError

    return (
      <div id="exchange" className={addPrefixClass("widget-exchange")}>
        <div className={addPrefixClass("widget-exchange__body")}>
          <div className={addPrefixClass("widget-exchange__column")}>
            <div className={addPrefixClass("widget-exchange__column-item")}>
              <div>{this.getError()}</div>

              <div className={addPrefixClass("widget-exchange__text theme-text")}>
                {this.props.exchange.type === 'swap' && (
                  <div>You are about to swap</div>
                )}
                {this.props.exchange.type === 'buy' && (
                  <div>{this.props.translate("transaction.you_about_to_buy") || "You are about to buy"}</div>
                )}
                {this.props.exchange.type === 'pay' && (
                  <div>{this.props.translate("transaction.you_about_to_pay") || "You are about to pay"}</div>
                )}
              </div>

              <div>
                <div className={"common__text-container-bold common__text-bold"}>
                  {this.props.exchange.isHaveDestAmount && this.props.exchange.sourceTokenSymbol !== this.props.exchange.destTokenSymbol && (
                    <div>{converter.caculateSourceAmount(this.props.exchange.destAmount, this.props.exchange.offeredRate, 6)} {this.props.exchange.sourceTokenSymbol}</div>
                  )}
                  {this.props.exchange.isHaveDestAmount && this.props.exchange.sourceTokenSymbol === this.props.exchange.destTokenSymbol && (
                    <div>{('' + this.props.exchange.destAmount).length > 8 ? converter.roundingNumber(this.props.exchange.destAmount) : this.props.exchange.destAmount} {this.props.exchange.destTokenSymbol}</div>
                  )}
                  {!this.props.exchange.isHaveDestAmount && (
                    <div>{('' + this.props.exchange.sourceAmount).length > 8 ? converter.roundingNumber(this.props.exchange.sourceAmount) : this.props.exchange.sourceAmount} {this.props.exchange.sourceTokenSymbol}</div>
                  )}
                </div>
                <div className={"common__text-container"}>
                  <span className={"common__text-light"}>Your wallet: </span>
                  <span className={"common__text"}>{this.getWalletType()}</span>
                </div>
                <div className={"common__text-container"}>
                  <span className={"common__text-light"}>Your address: </span>
                  <span className={"common__text"}>{this.props.account.address.slice(0, 12)}...{this.props.account.address.slice(-10)}</span>
                </div>
              </div>

              {/*SWAP*/}
              {/*<strong>{this.props.exchange.snapshot.sourceAmount} {this.props.exchange.sourceTokenSymbol}</strong> for <strong>{this.getDestPay()} {this.props.exchange.destTokenSymbol}</strong>*/}

              {/*BUY*/}
              {/*{('' + this.props.exchange.destAmount).length > 8 ? converter.roundingNumber(this.props.exchange.destAmount) : this.props.exchange.destAmount} {this.props.exchange.destTokenSymbol}*/}

              <div>
                {this.props.advanceConfig}
              </div>
            </div>
            <div className={addPrefixClass("widget-exchange__column-item")}>
              {this.props.orderDetails}
            </div>
          </div>
        </div>

        <div className={addPrefixClass("widget-exchange__bot")}>
          {txError !== "" && (
            <div className={addPrefixClass("error-message")}>
              {txError}
            </div>
          )}

          {this.props.exchange.isNeedApprove && (
            <div className={addPrefixClass("approve-intro")}>
              {this.props.translate("modal.approve_exchange", { token: this.props.exchange.sourceTokenSymbol })
              || `You need to grant permission for Kyber Payment to interact with ${this.props.exchange.sourceTokenSymbol} with this address`}
            </div>
          )}

          {this.props.account.type === "keystore" && (
            <div id="import-account">
              <div className={addPrefixClass("import-account-content__private-key" + (this.state.showPassword ? ' unlock' : ''))}>
                <input
                  className={addPrefixClass(this.state.showPassword ? "import-account-content__private-key-input" : "import-account-content__private-key-input security")}
                  id="passphrase"
                  type="text"
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                  onKeyPress={this.resetPasswordError}
                  onFocus={(e) => this.props.global.analytics.callTrack("clickFocusToInputJSONPws")}
                />
                <div className={addPrefixClass("import-account-content__private-key-toggle")} onClick={this.toogleShowPassword}></div>
                <div className={addPrefixClass("import-account-content__private-key-icon")}></div>
              </div>
              {(this.props.exchange.passwordError) && (
                <div className={addPrefixClass("error-password")}>
                  {this.props.exchange.passwordError}
                </div>
              )}
            </div>
          )}

          {(this.props.exchange.isConfirming || this.props.transfer.isConfirming) && (
            <div className={addPrefixClass("confirm-message")}>{this.props.account.type !== "keystore" ? (this.props.translate("modal.waiting_for_confirmation") || "Waiting for confirmation from your wallet") : ""}</div>
          )}

          <div className={addPrefixClass("common__flexbox between")}>
            <div className={addPrefixClass("common__button hollow theme-button" + (this.props.exchange.isConfirming || this.props.transfer.isConfirming ? " disable" : ""))} onClick={this.reImportAccount}>
              {this.props.translate("transaction.back") || "Back"}
            </div>

            {this.props.exchange.isNeedApprove && (
              <div className={addPrefixClass("common__button theme-gradient" + classDisable)} onClick={this.approveToken}>
                {this.props.translate("transaction.approve") || "Approve"}
              </div>
            )}

            {!this.props.exchange.isNeedApprove && (
              <div className={addPrefixClass("common__button theme-gradient" + classDisable)} onClick={this.payment}>
                {this.props.translate("transaction.confirm") || "Confirm"}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}
