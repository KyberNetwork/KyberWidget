import React from "react"
import { connect } from "react-redux"
import { ExchangeBody, MinRate } from "../Exchange"
//import {GasConfig} from "../TransactionCommon"
import { AdvanceConfigLayout, GasConfig } from "../../components/TransactionCommon"




//import {TransactionLayout} from "../../components/TransactionCommon"
import { getTranslate } from 'react-localize-redux'

import * as converter from "../../utils/converter"
import * as validators from "../../utils/validators"
import * as exchangeActions from "../../actions/exchangeActions"

import * as transferActions from "../../actions/transferActions"

import * as accountActions from "../../actions/accountActions"


import { default as _ } from 'underscore'
import { clearSession } from "../../actions/globalActions"

import { ImportAccount } from "../ImportAccount"
import { KeyStore, Trezor, Ledger, PrivateKey, Metamask } from "../../services/keys"
import {addPrefixClass} from "../../utils/className"

//import {HeaderTransaction} from "../TransactionCommon"


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
      //  passwordError: ""
    }
  }

  reImportAccount = () => {
    this.props.dispatch(exchangeActions.goToStep(2, 3))
    this.props.global.analytics.callTrack("clickToBack", 2)

    this.props.dispatch(accountActions.clearWatchMetamask())
  }

  approveToken = () => {
    // const params = this.formParamOfSnapshot()
    // console.log(params)
    var params = this.formParamOfSnapshotMaxDest()

    // var params
    // if (this.props.exchange.isHaveDestAmount) {
    //   params = this.formParamOfSnapshotMaxDest()
    // } else {
    //   params = this.formParamOfSnapshot()
    // }

    const account = this.props.account
    const ethereum = this.props.ethereum
    this.props.dispatch(exchangeActions.doApprove(ethereum, params.sourceToken, params.sourceAmount, params.nonce, params.gas_approve, params.gasPrice,
      account.keystring, account.password, account.type, account, this.props.keyService, params.sourceTokenSymbol))
    this.props.global.analytics.callTrack("clickToApprove", params.sourceTokenSymbol)
  }

  // processTransferTx = () => {
  //   try {
  //     var password = ""
  //     if (this.props.account.type === "keystore") {
  //       password = document.getElementById("passphrase").value
  //       document.getElementById("passphrase").value = ''
  //     }

  //     var sourceTokenSymbol = this.props.exchange.sourceTokenSymbol


  //     // sending by wei
  //     var account = this.props.account
  //     var nonce = validators.verifyNonce(this.props.account.getUsableNonce())
  //     var ethereum = this.props.ethereum
  //     var formId = "transfer"
  //     var data = ""

  //     //const params = this.formParams()
  //     var token = this.props.exchange.destTokenSymbol
  //     var tokenAddress = this.props.tokens[token].address
  //     var tokenDecimal = this.props.tokens[token].decimal
  //     var tokenName = this.props.tokens[token].tokenName

  //     var amount
  //     if (this.props.exchange.isHaveDestAmount) {
  //       amount = converter.stringToHex(this.props.exchange.destAmount, tokenDecimal)
  //     } else {
  //       amount = converter.stringToHex(this.props.exchange.sourceAmount, tokenDecimal)
  //     }


  //     var destAddress = this.props.exchange.receiveAddr
  //     var gas = converter.numberToHex(this.props.exchange.gas)
  //     var gasPrice = converter.numberToHex(converter.gweiToWei(this.props.exchange.gasPrice))

  //     var balanceData = {
  //       //balance: this.props.form.balance.toString(),
  //       name: tokenName,
  //       decimal: tokenDecimal,
  //       tokenSymbol: token,
  //       amount: this.props.destAmount
  //     }

  //     this.props.dispatch(transferActions.processTransfer(formId, ethereum, account.address,
  //       tokenAddress, amount,
  //       destAddress, nonce, gas,
  //       gasPrice, account.keystring, account.type, password, account, data, this.props.keyService, balanceData))
  //   } catch (e) {
  //     console.log(e)
  //     //this.props.dispatch(transferActions.throwPassphraseError(this.props.translate("error.passphrase_error")))
  //     // this.setState({passwordError : this.props.translate("error.passphrase_error") || "Key derivation failed - possibly wrong password" })
  //   }
  // }

  getSourceAmount = () => {
    //var sourceAmount = converter.stringToHex(this.props.snapshot.sourceAmount, this.props.snapshot.sourceDecimal)
    var sourceTokenSymbol = this.props.exchange.sourceTokenSymbol
    var minConversionRate = this.props.snapshot.minConversionRate
    var ethValue = converter.toEther(this.props.snapshot.productPrice)
    var sourceAmount = converter.caculateSourceAmount(ethValue, minConversionRate, 6)

    sourceAmount = converter.stringToHex(sourceAmount, this.props.tokens[sourceTokenSymbol].decimal)
    return sourceAmount
  }

  // formParamOfSnapshot = () => {
  //   var selectedAccount = this.props.account.address
  //   var sourceToken = this.props.snapshot.sourceToken


  //   var sourceAmount = converter.stringToHex(this.props.snapshot.sourceAmount, this.props.snapshot.sourceDecimal)


  //   var destToken = this.props.snapshot.destToken

  //   var minConversionRate = converter.toTWei(this.props.snapshot.minConversionRate)
  //   minConversionRate = converter.numberToHex(minConversionRate)

  //   var blockNo
  //   if (this.props.exchange.commissionID) {
  //     blockNo = this.props.exchange.commissionID
  //   } else {
  //     blockNo = converter.numberToHexAddress(this.props.snapshot.blockNo)
  //   }

  //   var destAddress
  //   if (this.props.exchange.isSwap){
  //     destAddress = this.props.account.address
  //   }else{
  //     destAddress = this.props.exchange.receiveAddr
  //   }
    

  //   var maxDestAmount = converter.biggestNumber()

  //   var throwOnFailure = this.props.snapshot.throwOnFailure
  //   var nonce = validators.verifyNonce(this.props.account.getUsableNonce())
  //   // should use estimated gas
  //   var gas = converter.numberToHex(this.props.snapshot.gas)
  //   var gas_approve = converter.numberToHex(this.props.snapshot.gas_approve)
  //   // should have better strategy to determine gas price
  //   var gasPrice = converter.numberToHex(converter.gweiToWei(this.props.snapshot.gasPrice))
  //   var sourceTokenSymbol = this.props.snapshot.sourceTokenSymbol
  //   var balanceData = {
  //     sourceName: this.props.snapshot.sourceName,
  //     sourceSymbol: this.props.snapshot.sourceTokenSymbol,
  //     sourceDecimal: this.props.snapshot.sourceDecimal,
  //     // source: this.props.snapshot.sourceBalance.toString(),
  //     destName: this.props.snapshot.destName,
  //     destDecimal: this.props.snapshot.destDecimal,
  //     destSymbol: this.props.snapshot.destTokenSymbol,
  //     //  dest: this.props.snapshot.destBalance.toString(),

  //     // sourceAmount: this.props.form.balanceData.sourceAmount,
  //     // destAmount: this.props.form.balanceData.destAmount,
  //   }
  //   //var balanceData = {}
  //   return {
  //     selectedAccount, sourceToken, sourceAmount, destToken,
  //     minConversionRate, destAddress, maxDestAmount,
  //     throwOnFailure, nonce, gas, gas_approve, gasPrice, balanceData, sourceTokenSymbol, blockNo
  //   }
  // }

  formParamOfSnapshotMaxDest = () => {
    var selectedAccount = this.props.account.address
    var sourceTokenSymbol = this.props.exchange.sourceTokenSymbol
    var sourceToken =  this.props.tokens[sourceTokenSymbol].address


    var sourceAmount = this.getSourceAmount()


    var destToken = "ETH"

    var minConversionRate = this.props.snapshot.minConversionRate
    minConversionRate = converter.numberToHex(minConversionRate)

    var blockNo
    if (this.props.exchange.commissionID) {
      blockNo = this.props.exchange.commissionID
    } else {
      blockNo = converter.numberToHexAddress(this.props.snapshot.blockNo)
    }

    var destAddress = this.props.exchange.receiveAddr
    var maxDestAmount = converter.toHex(this.props.snapshot.productPrice)

    var throwOnFailure = this.props.snapshot.throwOnFailure
    var nonce = validators.verifyNonce(this.props.account.getUsableNonce())
    // should use estimated gas
    var gas = converter.numberToHex(this.props.snapshot.gas)
    var gas_approve = converter.numberToHex(this.props.snapshot.gas_approve)
    // should have better strategy to determine gas price
    var gasPrice = converter.numberToHex(converter.gweiToWei(this.props.snapshot.gasPrice))
    var sourceTokenSymbol = this.props.snapshot.sourceTokenSymbol
    var balanceData = {
      sourceName: this.props.snapshot.sourceName,
      sourceSymbol: this.props.snapshot.sourceTokenSymbol,
      sourceDecimal: this.props.tokens[sourceTokenSymbol].decimal,
      // source: this.props.snapshot.sourceBalance.toString(),
      destName: this.props.snapshot.destName,
      destDecimal: this.props.snapshot.destDecimal,
      destSymbol: this.props.snapshot.destTokenSymbol,
      //  dest: this.props.snapshot.destBalance.toString(),

      // sourceAmount: this.props.form.balanceData.sourceAmount,
      // destAmount: this.props.form.balanceData.destAmount,
    }
    //var balanceData = {}
    return {
      selectedAccount, sourceToken, sourceAmount, destToken,
      minConversionRate, destAddress, maxDestAmount,
      throwOnFailure, nonce, gas, gas_approve, gasPrice, balanceData, sourceTokenSymbol, blockNo
    }
  }
  processExchangeTx = () => {
    // var errors = {}
    try {
      var password = ""
      if (this.props.account.type === "keystore") {
        password = document.getElementById("passphrase").value
        document.getElementById("passphrase").value = ''
      }
      //const params = this.formParams()
      var params = this.formParamOfSnapshotMaxDest()
      // var params
      // if (this.props.exchange.isHaveDestAmount) {
      //   params = this.formParamOfSnapshotMaxDest()
      // } else {
      //   params = this.formParamOfSnapshot()
      // }

      //check nonce
      var nonce = this.props.account.getUsableNonce()

      var account = this.props.account
      var ethereum = this.props.ethereum

      var formId = "exchange"
      var data = ""

      // console.log("params: ")
      // console.log(params)
      var getTxData = this.props.exchange.getTxData

      this.props.dispatch(exchangeActions.processExchange(formId, ethereum, account.address, params.sourceToken,
        params.sourceAmount, params.destToken, params.destAddress,
        params.maxDestAmount, params.minConversionRate,
        params.throwOnFailure, params.nonce, params.gas,
        params.gasPrice, account.keystring, account.type, password, account, data, this.props.keyService, params.balanceData, params.sourceTokenSymbol, params.blockNo, getTxData))


    } catch (e) {
      console.log(e)
      //   this.setState({passwordError : this.props.translate("error.passphrase_error") || "Key derivation failed - possibly wrong password" })

      //  this.props.dispatch(exchangeActions.throwPassphraseError(this.props.translate("error.passphrase_error")))
    }
  }

  payment = () => {
    // var sourceTokenSymbol = this.props.exchange.sourceTokenSymbol
    // var destTokenSymbol = this.props.exchange.destTokenSymbol

    // if (sourceTokenSymbol === destTokenSymbol) {
    //   this.processTransferTx("")
    // } else {
    //   this.processExchangeTx()
    // }
    this.processExchangeTx()
  }

  getError = () => {
    var errors = this.props.exchange.errors
    var errorItem = Object.keys(errors).map(key => {
      if (errors[key] && errors[key] !== "") {
        return <li key={key}>{this.props.translate(errors[key]) || errors[key]}</li>
      }
      return ""
    })
    return <ul>{errorItem}</ul>
  }


  getValueYoupay = () => {
    if (this.props.exchange.sourceSymbol === this.props.exchange.destTokenSymbol) {
      return this.props.destAmount
    } else {
      return converter.caculateSourceAmount(this.props.exchange.destAmount, this.props.exchange.offeredRate, 6)
    }
  }

  getAccountBgk = () => {
    const sourceTokenSymbol = this.props.exchange.sourceTokenSymbol;
    const sourceBalance = this.props.tokens[sourceTokenSymbol].balance;
    const sourceDecimal = this.props.tokens[sourceTokenSymbol].decimal;
    const ethBalance = this.props.tokens["ETH"].balance;
    let icon, method;

    switch (this.props.account.type) {
      case "metamask":
        icon = 'metamask_active.svg';
        method = "Metamask";
        break;
      case "keystore":
        icon = 'keystore_active.svg';
        method = "Json";
        break;
      case "privateKey":
        icon = 'privatekey_active.svg';
        method = "Private key";
        break;
      case "trezor":
        icon = 'trezor_active.svg';
        method = "Trezor";
        break;
      case "ledger":
        icon = 'ledger_active.svg';
        method = "Ledger";
        break;
      default:
        return false;
    }

    return <div className={addPrefixClass("import-account-content__info import-account-content__info--center")}>
      <div className={addPrefixClass("import-account-content__info-type")}>
        <img className={addPrefixClass("import-account-content__info-type-image")} src={require(`../../../assets/img/landing/${icon}`)} />
        <div className={addPrefixClass("import-account-content__info-type-text")}>{method}</div>
      </div>
      <div className={addPrefixClass("import-account-content__info-text")}>
        <div className={addPrefixClass("import-account-content__info-text-address")}>
          {this.props.translate("transaction.address") || "Address"}: {this.props.account.address.slice(0, 8)}...{this.props.account.address.slice(-6)}
        </div>
        <div className={addPrefixClass("import-account-content__info-text-balance")}>
          <div>{this.props.translate("transaction.balance") || "Balance"}:</div>
          <div>
            <div>{converter.roundingNumber(converter.toT(ethBalance, 18))} ETH</div>

            {sourceTokenSymbol !== "ETH" && (
              <div>{converter.roundingNumber(converter.toT(sourceBalance, sourceDecimal))} {sourceTokenSymbol}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  };


  toogleShowPassword = () => {
    this.setState({showPassword : !this.state.showPassword})
    this.props.global.analytics.callTrack("clickShowPassword", this.state.showPassword ? "show" : "hide")
  }

  resetPasswordError = () => {
    this.props.dispatch(exchangeActions.throwPassphraseError(""))
    this.props.dispatch(transferActions.throwPassphraseError(""))
  }

  getGasUsed = () => {
    console.log("gas_limit")
    var tokenSymbol = this.props.exchange.sourceTokenSymbol
    var gasLimitToken = this.props.tokens[tokenSymbol].gasLimit
    var gasLimit = gasLimitToken ? parseInt(gasLimitToken) : this.props.exchange.normal_max_gas
    var gasUsed = gasLimit + this.props.exchange.max_gas_catch_mons
    return gasUsed
  }

  getMaxGasApprove = (source) => {
    var tokenSymbol = this.props.exchange.sourceTokenSymbol
    var gasApprove = this.props.tokens[tokenSymbol].gasApprove
    if (gasApprove) return gasApprove
    if (source !== 'DGX') {
      return 100000
    } else {
      return 120000
    }
  }
  
  render() {
    var gasUsed;
    if (this.props.exchange.isFetchingGas){
      gasUsed = <img src={require('../../../assets/img/waiting.svg')} />
    }else{
      // gasUsed = this.props.exchange.gas
      gasUsed = this.getGasUsed()
      if (this.props.exchange.isNeedApprove) {
        var gasApprove = this.getMaxGasApprove()
        gasUsed += gasApprove
      }
    }


    var classError = ""
    var isHaveError = false
    if (validators.anyErrors(this.props.exchange.errors)) {
      classError += " error"
      isHaveError = true
    }

    var classDisable = ""
    if (!this.props.exchange.validateAccountComplete || this.props.exchange.isConfirming || this.props.exchange.isFetchingGas) {
      classDisable += " disable"
    }

    var signExchangeError = this.props.exchange.signError ? this.props.exchange.signError : ""
    var broadcastExchangeError = this.props.exchange.broadcastError ? this.props.exchange.broadcastError : ""
    var txError = signExchangeError + broadcastExchangeError

    //var haveProductName = this.props.exchange.productName && this.props.exchange.productName !== "" ? true : false
    //var haveProductAvatar = this.props.exchange.productAvatar && this.props.exchange.productAvatar !== "" ? true : false

    return (
      <div id="exchange" className={addPrefixClass("widget-exchange k-frame payment_confirm" + classError)}>

        {/* <div className="payment-gateway__step-title payment-gateway__step-title--3">
          {this.props.translate("transaction.confirm_transaction") || "Confirm Transaction"}
        </div> */}

        {this.getAccountBgk()}

        <div className={addPrefixClass("error-message")}>
          {this.getError()}
        </div>

        <div className={addPrefixClass("payment-info")}>
          <div className={addPrefixClass("k-title")}>
            {this.props.translate("transaction.you_about_to_pay") || "YOU ARE ABOUT TO PAY"}
          </div>
          <div className={addPrefixClass(this.props.global.params.productAvatar && this.props.global.params.productAvatar != "" ? "product-avatar" : "") }>
            {this.props.global.params.productAvatar &&  this.props.global.params.productAvatar != "" ?
              <div className={addPrefixClass("kyber-avatar")}><img src={this.props.global.params.productAvatar} /></div> : ""
            }
            <div className={addPrefixClass("k-content")}>
              {this.props.global.params.productId && (
                <div>
                  <span>{this.props.translate("transaction.product_id") || "Product Id"}:</span>
                  <span>
                    {this.props.global.params.productId}
                  </span>
                </div>
              )}
              
              {this.props.global.params.productName && (
                <div>
                  <span>{this.props.translate("transaction.product_name") || "Product Name"}:</span>
                  <span>
                    {this.props.global.params.productName}
                  </span>
                </div>
              )}

              <div>
                <span>{this.props.translate("transaction.product_value") || "Price"}:</span>
                <span>
                  {converter.toEther(this.props.exchange.productPrice)} ETH
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={addPrefixClass("payment-info")}>
          {/* <div className="title">
            {this.props.translate("transaction.exchange_paywith") || "PAY WITH"}
          </div> */}
          <div className={addPrefixClass("k-content")}>
            {/* <div>
              <span>{this.props.translate("transaction.amount") || "Amount"}:</span>
                <span>{converter.caculateSourceAmount( converter.toEther(this.props.exchange.monsterInETH), this.props.exchange.expectedRate, 6)} {this.props.exchange.sourceTokenSymbol}</span>
            </div> */}

            <div className={addPrefixClass("payment-info")}>
              <div className={addPrefixClass("k-title")}>
                {this.props.translate("transaction.exchange_paywith") || "PAY WITH"}
              </div>
              <div className={addPrefixClass("k-content")}>
                <div>
                  <span>{this.props.translate("transaction.amount") || "Amount"}:</span>
                  <span>{converter.caculateSourceAmount( converter.toEther(this.props.exchange.productPrice), this.props.exchange.expectedRate, 6)} {this.props.exchange.sourceTokenSymbol}</span>

                  {/* {this.props.exchange.isHaveDestAmount && this.props.exchange.sourceTokenSymbol !== this.props.exchange.destTokenSymbol && (
                    <span>{converter.caculateSourceAmount(this.props.exchange.destAmount, this.props.exchange.offeredRate, 6)} {this.props.exchange.sourceTokenSymbol}</span>
                  )}
                  {this.props.exchange.isHaveDestAmount && this.props.exchange.sourceTokenSymbol === this.props.exchange.destTokenSymbol && (
                    <span>{('' + this.props.exchange.destAmount).length > 8 ? converter.roundingNumber(this.props.exchange.destAmount) : this.props.exchange.destAmount} {this.props.exchange.destTokenSymbol}</span>
                  )}
                  {!this.props.exchange.isHaveDestAmount && (
                    <span>{('' + this.props.exchange.sourceAmount).length > 8 ? converter.roundingNumber(this.props.exchange.sourceAmount) : this.props.exchange.sourceAmount} {this.props.exchange.sourceTokenSymbol}</span>
                  )} */}

                </div>
                <div>
                  <span>{this.props.translate("transaction.gas_price") || "Gas price"}:</span>
                  <span>
                    {this.props.exchange.gasPrice} Gwei
              </span>
                </div>
                <div>
                  <span>{this.props.translate("transaction.gas_limit") || "Gas limit"}:</span>
                  <span>
                    {gasUsed}
                  </span>
                </div>
                <div>
                  <span>{this.props.translate("transaction.transaction_fee") || "Trasaction fee"}:</span>
                  {!this.props.exchange.isFetchingGas && (
                    <span>
                      {converter.calculateGasFee(this.props.exchange.gasPrice, gasUsed)}
                    </span>
                  )}

                </div>
              </div>
            </div>
          </div>
        
        </div>




        <div className={addPrefixClass("payment-bottom")}>
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
              {/* <div className="password">
                <input id="passphrase" type="password" placeholder="password"/>                  
              </div> */}
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
              <div className={addPrefixClass("confirm-message")}>{this.props.account.type !== "keystore" && this.props.account.type !== "privateKey" ? (this.props.translate("modal.waiting_for_confirmation") || "Waiting for confirmation from your wallet") : ""}</div>
            )}
          <div className={addPrefixClass("control-btn")}>

            <a className={addPrefixClass("back-btn" + (this.props.exchange.isConfirming || this.props.transfer.isConfirming ? " disable" : ""))} onClick={this.reImportAccount}>{this.props.translate("transaction.back") || "Back"}</a>

            {this.props.exchange.isNeedApprove && (
              <a className={addPrefixClass("confirm-btn" + classDisable)} onClick={this.approveToken}>
                {this.props.translate("transaction.approve") || "Approve"}
              </a>
            )}

            {!this.props.exchange.isNeedApprove && (
              <a className={addPrefixClass("confirm-btn" + classDisable)} onClick={this.payment}>
                {this.props.translate("transaction.confirm") || "Confirm"}
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }
}
