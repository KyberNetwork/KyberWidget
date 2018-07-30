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


import { default as _ } from 'underscore'
import { clearSession } from "../../actions/globalActions"

import { ImportAccount } from "../ImportAccount"
import { KeyStore, Trezor, Ledger, PrivateKey, Metamask } from "../../services/keys"

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
  const snapshot = store.exchange.snapshot
  const ethereum = store.connection.ethereum

  const keyService = getKeyService(account.type)

  return {
    translate, exchange, tokens, account, ethereum, keyService, snapshot

  }
})


export default class Payment extends React.Component {
  constructor(){
    super()
    this.state = {
      showPassword: false,
    //  passwordError: ""
    }
  }

  reImportAccount = () => {
    this.props.dispatch(exchangeActions.goToStep(2, 3))
  }

  approveToken = () => {
    // const params = this.formParamOfSnapshot()
    // console.log(params)
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
  }

  processTransferTx = () => {
    try {
      var password = ""
      if (this.props.account.type === "keystore") {
        password = document.getElementById("passphrase").value
        document.getElementById("passphrase").value = ''
      }

      var sourceTokenSymbol = this.props.exchange.sourceTokenSymbol


      // sending by wei
      var account = this.props.account
      var nonce = validators.verifyNonce(this.props.account.getUsableNonce())
      var ethereum = this.props.ethereum
      var formId = "transfer"
      var data = ""

      //const params = this.formParams()
      var token = this.props.exchange.destTokenSymbol
      var tokenAddress = this.props.tokens[token].address
      var tokenDecimal = this.props.tokens[token].decimal
      var tokenName = this.props.tokens[token].tokenName
      var amount = converter.stringToHex(this.props.exchange.destAmount, tokenDecimal)
      var destAddress = this.props.exchange.receiveAddr
      var gas = converter.numberToHex(100000)
      var gasPrice = converter.numberToHex(converter.gweiToWei(this.props.exchange.gasPrice))

      var balanceData = {
        //balance: this.props.form.balance.toString(),
        name: tokenName,
        decimal: tokenDecimal,
        tokenSymbol: token,
        amount: this.props.destAmount
      }

      this.props.dispatch(transferActions.processTransfer(formId, ethereum, account.address,
        tokenAddress, amount,
        destAddress, nonce, gas,
        gasPrice, account.keystring, account.type, password, account, data, this.props.keyService, balanceData))
    } catch (e) {
      console.log(e)
      //this.props.dispatch(transferActions.throwPassphraseError(this.props.translate("error.passphrase_error")))
     // this.setState({passwordError : this.props.translate("error.passphrase_error") || "Key derivation failed - possibly wrong password" })
    }
  }

  getSourceAmount = () => {
    //var sourceAmount = converter.stringToHex(this.props.snapshot.sourceAmount, this.props.snapshot.sourceDecimal)
    var minConversionRate = converter.toTWei(this.props.snapshot.minConversionRate)

    var sourceAmount = converter.caculateSourceAmount(this.props.snapshot.destAmount, minConversionRate, 6)

    sourceAmount = converter.stringToHex(sourceAmount, this.props.snapshot.sourceDecimal)
    return sourceAmount
  }

  formParamOfSnapshot = () => {
    var selectedAccount = this.props.account.address
    var sourceToken = this.props.snapshot.sourceToken


    var sourceAmount = converter.stringToHex(this.props.snapshot.sourceAmount, this.props.snapshot.sourceDecimal)


    var destToken = this.props.snapshot.destToken

    var minConversionRate = converter.toTWei(this.props.snapshot.minConversionRate)
    minConversionRate = converter.numberToHex(minConversionRate)

    var blockNo
    if (this.props.exchange.commissionID) {
      blockNo = this.props.exchange.commissionID
    } else {
      blockNo = converter.numberToHexAddress(this.props.snapshot.blockNo)
    }

    var destAddress = this.props.exchange.receiveAddr
    var maxDestAmount = converter.biggestNumber()

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
      sourceDecimal: this.props.snapshot.sourceDecimal,
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

  formParamOfSnapshotMaxDest = () => {
    var selectedAccount = this.props.account.address
    var sourceToken = this.props.snapshot.sourceToken


    var sourceAmount = this.getSourceAmount()


    var destToken = this.props.snapshot.destToken

    var minConversionRate = converter.toTWei(this.props.snapshot.minConversionRate)
    minConversionRate = converter.numberToHex(minConversionRate)

    var blockNo
    if (this.props.exchange.commissionID) {
      blockNo = this.props.exchange.commissionID
    } else {
      blockNo = converter.numberToHexAddress(this.props.snapshot.blockNo)
    }

    var destAddress = this.props.exchange.receiveAddr
    var maxDestAmount = converter.stringToHex(this.props.snapshot.destAmount, this.props.snapshot.destDecimal)

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
      sourceDecimal: this.props.snapshot.sourceDecimal,
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
      var params
      if (this.props.exchange.isHaveDestAmount) {
        params = this.formParamOfSnapshotMaxDest()
      } else {
        params = this.formParamOfSnapshot()
      }

      //check nonce
      var nonce = this.props.account.getUsableNonce()

      var account = this.props.account
      var ethereum = this.props.ethereum

      var formId = "exchange"
      var data = ""

      // console.log("params: ")
      // console.log(params)


      this.props.dispatch(exchangeActions.processExchange(formId, ethereum, account.address, params.sourceToken,
        params.sourceAmount, params.destToken, params.destAddress,
        params.maxDestAmount, params.minConversionRate,
        params.throwOnFailure, params.nonce, params.gas,
        params.gasPrice, account.keystring, account.type, password, account, data, this.props.keyService, params.balanceData, params.sourceTokenSymbol, params.blockNo))


    } catch (e) {
      console.log(e)
   //   this.setState({passwordError : this.props.translate("error.passphrase_error") || "Key derivation failed - possibly wrong password" })

    //  this.props.dispatch(exchangeActions.throwPassphraseError(this.props.translate("error.passphrase_error")))
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
  }

  getError = () => {
    var errors = this.props.exchange.errors
    var errorItem = Object.keys(errors).map(key => {
      if (errors[key] && errors[key] !== ""){
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
    switch (this.props.account.type) {
      case "metamask":
        return <div className="account-bgk">
          <div className="metamask-bgk">
            <img alt="metamask" src={require('../../../assets/img/landing/metamask_active.svg')}/>
          </div>
          <div className="text">METAMASK</div>
        </div>
      case "keystore":
        return <div className="account-bgk">
          <div className="keystore-bgk">
            <img alt="keystore" src={require('../../../assets/img/landing/keystore_active.svg')}/>
          </div>
          <div className="text">JSON</div>
        </div>
      case "privateKey":
        return <div className="account-bgk">
          <div className="privateKey-bgk">
            <img alt="private key" src={require('../../../assets/img/landing/privatekey_active.svg')}/>
          </div>
          <div className="text">Private key</div>
        </div>
      case "trezor":
        return <div className="account-bgk">
          <div className="trezor-bgk">
            <img alt="keystore" src={require('../../../assets/img/landing/trezor_active.svg')}/>
          </div>
          <div className="text">Trezor</div>
        </div>
      case "ledger":
        return <div className="account-bgk">
          <div className="ledger-bgk">
            <img alt="ledger" src={require('../../../assets/img/landing/ledger_active.svg')}/>
          </div>
          <div className="text">Ledger</div>
        </div>
    }
  }


  toogleShowPassword = () => {
    this.setState({showPassword : !this.state.showPassword})
  }

  resetPasswordError = () => {
    this.props.dispatch(exchangeActions.throwPassphraseError(""))
  }
  
  render() {

    var sourceTokenSymbol = this.props.exchange.sourceTokenSymbol
    //var destTokenSymbol = this.props.exchange.destTokenSymbol
    var sourceBalance = this.props.tokens[sourceTokenSymbol].balance
    var sourceDecimal = this.props.tokens[sourceTokenSymbol].decimal

    var ethBalance = this.props.tokens["ETH"].balance

    var gasUsed = this.props.exchange.gas
    if (this.props.exchange.isNeedApprove) {
      gasUsed += this.props.exchange.gas_approve
    }

    var classError = ""
    var isHaveError = false
    if (validators.anyErrors(this.props.exchange.errors)){
      classError += " error"
      isHaveError = true
    }
    
    var classDisable = ""
    if (!this.props.exchange.validateAccountComplete){
      classDisable += " disable"
    }
    return (
      <div id="exchange" className={"frame payment_confirm" + classError}>        

        <div className="payment-gateway__step-title payment-gateway__step-title--3">
          {this.props.translate("transaction.confirm_transaction") || "Confirm Transaction"}
        </div>

        <div className="account-item">
          {this.getAccountBgk()}
          <div className="account-info">
            <div className="info-row address-info">
                <span>{this.props.translate("transaction.address") || "Address"}:</span> 
                <span>{this.props.account.address.slice(0, 8)} ... {this.props.account.address.slice(-6)}</span>
              </div>            
            {sourceTokenSymbol === "ETH" && (
              <div className="info-row">
                <span>{this.props.translate("transaction.balance") || "Balance"}:</span>
                <span>{converter.roundingNumber(converter.toT(ethBalance, 18))} ETH</span>
              </div>
            )}
            {sourceTokenSymbol !== "ETH" && (
              <div>
              <div className="info-row">        
                <span>{this.props.translate("transaction.balance") || "Balance"}:</span>        
                <span>{converter.roundingNumber(converter.toT(ethBalance, 18))} ETH</span>
              </div>
              <div className="info-row">
                <span></span> 
                <span>{converter.roundingNumber(converter.toT(sourceBalance, sourceDecimal))} {sourceTokenSymbol}</span>
              </div>
              </div>
            )}
          </div>
        </div>

        <div className="error-message">
          {this.getError()}
        </div>

        <div className="payment-info">
          <div className="title">
            {this.props.translate("transaction.you_about_to_pay") || "YOU ARE ABOUT TO PAY"}
          </div>
          <div className="content">
            {/* <div>
              <span>To:</span>
              <span>kyber.network</span>
            </div> */}
            <div>
              <span>{this.props.translate("transaction.address") || "Address"}:</span>
              <span>
                {this.props.exchange.receiveAddr.slice(0, 8)} ... {this.props.exchange.receiveAddr.slice(-6)}
              </span>
            </div>
            {this.props.exchange.isHaveDestAmount && (
              <div>
                <span>{this.props.translate("transaction.amount") || "Amount"}:</span>
                <span>
                  {this.props.exchange.destAmount} {this.props.exchange.destTokenSymbol}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="payment-info">
          <div className="title">
            {this.props.translate("transaction.exchange_paywith") || "PAY WITH"}
          </div>
          <div className="content">
            <div>
              <span>{this.props.translate("transaction.amount") || "Amount"}:</span>
              {this.props.exchange.isHaveDestAmount && (
                <span>{converter.caculateSourceAmount(this.props.exchange.destAmount, this.props.exchange.offeredRate, 6)} {this.props.exchange.sourceTokenSymbol}</span>
              )}
              {!this.props.exchange.isHaveDestAmount && (
                <span>{this.props.exchange.sourceAmount} {this.props.exchange.sourceTokenSymbol}</span>
              )}
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
              <span>
                {converter.calculateGasFee(this.props.exchange.gasPrice, gasUsed)}
              </span>
            </div>
          </div>
        </div>


        

        <div className="payment-bottom">
          {this.props.exchange.isNeedApprove && (
              <div className="approve-intro">                 
                  {this.props.translate("modal.approve_exchange", {token: this.props.exchange.sourceTokenSymbol}) 
                    || `You need to grant permission for Kyber Payment to interact with ${this.props.exchange.sourceTokenSymbol} with this address`}
              </div>
            )}
          {this.props.account.type === "keystore" && (
            <div id="import-account">
              {/* <div className="password">
                <input id="passphrase" type="password" placeholder="password"/>                  
              </div> */}
               <div className="import-account-content__private-key">
               <input
                   className={this.state.showPassword ?"import-account-content__private-key-input": "import-account-content__private-key-input security"} 
                   id="passphrase"
                   type="text"                                  
                   autoFocus
                   autoComplete="off"
                   spellCheck="false"
                   onKeyPress={this.resetPasswordError}
                    />
                   <div className="import-account-content__private-key-toggle" onClick={this.toogleShowPassword}></div>
                  <div className="import-account-content__private-key-icon"></div>
               </div>
               {this.props.exchange.passwordError !== "" && (
                 <div className="error-password">{this.props.exchange.passwordError}</div>
               )}
               </div>

            )}
          <div className="control-btn">
            <a className="back-btn" onClick={this.reImportAccount}>{this.props.translate("transaction.back") || "Back"}</a>
            {this.props.exchange.isNeedApprove && (
              <a className={"confirm-btn" + classDisable} onClick={this.approveToken}>
                {this.props.translate("transaction.approve") || "Approve"}
              </a>
            )}

            {!this.props.exchange.isNeedApprove && (
              <a className={"confirm-btn" + classDisable} onClick={this.payment}>
                {this.props.translate("transaction.payment") || "Payment"}
              </a>
            )}
          </div>

          

        </div>
      </div>
    )
  }
}
