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
import * as web3Package from "../../services/web3"
import SignerAddress from "../../components/ImportAccount/SignerAddress";

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
    if (web3Package.isDApp()) {
      this.props.dispatch(exchangeActions.goToStep(1, 3));
      this.props.global.analytics.callTrack("clickToBack", 1)
    } else {
      this.props.dispatch(exchangeActions.goToStep(2, 3));
      this.props.global.analytics.callTrack("clickToBack", 2)
    }

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
      account.keystring, account.password, account.type, account, this.props.keyService, params.sourceTokenSymbol, this.props.exchange.isApproveZero))
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
      var sourceTokenSymbol = this.props.exchange.sourceTokenSymbol
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
        this.props.keyService, balanceData, commissionID, paymentData, hint, sourceTokenSymbol))
    } catch (e) {
      console.log(e)
    }
  }

  getSourceAmount = () => {
    var minConversionRate = converter.toTWei(this.props.snapshot.minConversionRate)
    var sourceAmount = converter.caculateSourceAmount(this.props.snapshot.destAmount, minConversionRate, this.props.exchange.commissionFee, 6)

    this.props.dispatch(exchangeActions.setSourceAmount(sourceAmount));

    return converter.stringToHex(sourceAmount, this.props.snapshot.sourceDecimal)
  }

  formParamOfSnapshot = () => {
    var selectedAccount = this.props.account.address
    var sourceToken = this.props.snapshot.sourceToken
    var sourceAmount = converter.stringToHex(this.props.snapshot.sourceAmount, this.props.snapshot.sourceDecimal)
    var destToken = this.props.snapshot.destToken
    var minConversionRate = converter.toTWei(this.props.snapshot.minConversionRate)
    var blockNo = this.props.exchange.commissionID
    var commssionFee = this.props.exchange.commissionFee;    
    var destAddress

    minConversionRate = converter.numberToHex(minConversionRate)

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
      throwOnFailure, nonce, gas, gas_approve, gasPrice, balanceData, sourceTokenSymbol, blockNo, commssionFee, paymentData, hint
    }
  }

  formParamOfSnapshotMaxDest = () => {
    var selectedAccount = this.props.account.address
    var sourceToken = this.props.snapshot.sourceToken
    var sourceAmount = this.getSourceAmount()
    var destToken = this.props.snapshot.destToken
    var minConversionRate = converter.toTWei(this.props.snapshot.minConversionRate)
    var blockNo = this.props.exchange.commissionID;
    var commssionFee = this.props.exchange.commissionFee;
    var destAddress

    minConversionRate = converter.numberToHex(minConversionRate)

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
      throwOnFailure, nonce, gas, gas_approve, gasPrice, balanceData, sourceTokenSymbol, blockNo, commssionFee, paymentData, hint
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
        params.sourceTokenSymbol, params.blockNo, params.commssionFee, params.paymentData, params.hint
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
    let isError = false;

    const errorItems = Object.keys(errors).map(key => {
      if (errors[key] && errors[key] !== "") {
        isError = true;
        return <div key={key}>{errors[key]}</div>
      }

      return "";
    });

    if (!isError) {
      return false;
    }

    return <div>{errorItems}</div>
  };

  getSignerAddresses = ()  => {
    if (!this.props.exchange.signer) {
      return [];
    }

    let addresses = this.props.exchange.signer.split("_")

    return addresses.filter(function(item, pos) {
      return addresses.indexOf(item) == pos
    })
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
    this.props.global.analytics.callTrack("clickToggleRevealKeyStorePassword", !this.state.showPassword)
  }

  resetPasswordError = () => {
    this.props.dispatch(exchangeActions.throwPassphraseError(""))
    this.props.dispatch(transferActions.throwPassphraseError(""))
  }

  render() {
    const sourceTokenSymbol = this.props.exchange.sourceTokenSymbol;
    const sourceBalance = this.props.tokens[sourceTokenSymbol].balance;
    const sourceDecimal = this.props.tokens[sourceTokenSymbol].decimals;
    const ethBalance = this.props.tokens["ETH"].balance;
    const errors = this.props.exchange.errors;
    const isApprove = this.props.exchange.isNeedApprove || this.props.exchange.isApproveZero;
    const isConfirming = this.props.exchange.isConfirming || this.props.transfer.isConfirming;
    const isKeystoreOrPrivateKey = this.props.account.type === "keystore" || this.props.account.type === "privateKey";
    var classDisable = ""
    var txError = this.props.exchange.signError + this.props.exchange.broadcastError;

    if (!this.props.exchange.validateAccountComplete || isConfirming || this.props.exchange.isFetchingGas || errors.signer_invalid || errors.exceed_balance_fee || errors.exceed_balance) {
      classDisable += " disabled"
    }

    return (
      <div id="exchange" className={addPrefixClass("widget-exchange")}>
        <div className={addPrefixClass("widget-exchange__body")}>
          <div className={addPrefixClass(`widget-exchange__column ${this.props.exchange.type}`)}>
            <div className={addPrefixClass("widget-exchange__column-item")}>
              <div className={addPrefixClass("widget-exchange__text theme-text")}>
                {this.props.exchange.type === 'swap' && (
                  <div>{this.props.translate("payment.swap_title") || "You are about to swap"}</div>
                )}
                {this.props.exchange.type === 'buy' && (
                  <div>{this.props.translate("payment.buy_title") || "You are about to buy"}</div>
                )}
                {this.props.exchange.type === 'pay' && (
                  <div>{this.props.translate("payment.pay_title") || "You are about to pay"}</div>
                )}
              </div>

              <div>
                <div className={addPrefixClass("common__text-container-bold")}>
                  {this.props.exchange.type === 'pay' && (
                    <div className={addPrefixClass("common__text-semibold")}>
                      {this.props.exchange.isHaveDestAmount && this.props.exchange.sourceTokenSymbol !== this.props.exchange.destTokenSymbol && (
                        <div>{converter.caculateSourceAmount(this.props.exchange.destAmount, this.props.exchange.offeredRate, this.props.exchange.commissionFee, 6)} {this.props.exchange.sourceTokenSymbol}</div>
                      )}
                      {this.props.exchange.isHaveDestAmount && this.props.exchange.sourceTokenSymbol === this.props.exchange.destTokenSymbol && (
                        <div>{('' + this.props.exchange.destAmount).length > 8 ? converter.roundingNumber(this.props.exchange.destAmount) : this.props.exchange.destAmount} {this.props.exchange.destTokenSymbol}</div>
                      )}
                      {!this.props.exchange.isHaveDestAmount && (
                        <div>{('' + this.props.exchange.sourceAmount).length > 8 ? converter.roundingNumber(this.props.exchange.sourceAmount) : this.props.exchange.sourceAmount} {this.props.exchange.sourceTokenSymbol}</div>
                      )}
                    </div>
                  )}

                  {(this.props.exchange.type === 'swap' || this.props.exchange.type === 'buy') && (
                    <div className={addPrefixClass("common__text-semibold")}>
                      <span>{this.props.exchange.sourceAmount} {this.props.exchange.sourceTokenSymbol}</span>
                      <span className={addPrefixClass("common__text-small")}> {this.props.translate("common.to") || 'to'} </span>
                      <span>{this.props.exchange.destAmount} {this.props.exchange.destTokenSymbol}</span>
                    </div>
                  )}
                </div>
                {this.props.exchange.fluctuatingRate >= 10 && (
                  <div className={addPrefixClass("common__error common__error--mb2 box")}>
                    {this.props.translate('exchange.rate_tooltip', {fluctuatingRate: this.props.exchange.fluctuatingRate}) || `There is ${this.props.exchange.fluctuatingRate}% difference in price for the requested quantity compared to the default rate of 0.5 ETH`}
                  </div>
                )}
                <div className={addPrefixClass("common__text-container")}>
                  <span className={addPrefixClass("common__text small-margin-right")}>{this.props.translate('common.your_address') || "Your address"}: </span>
                  <span className={addPrefixClass("common__text")}>
                    {this.props.account.address.slice(0, 12)}...{this.props.account.address.slice(-10)}
                  </span>
                </div>
                <div className={addPrefixClass("common__text-container")}>
                  <span className={addPrefixClass("common__text small-margin-right")}>{this.props.translate("common.you_have") || "You have"}: </span>
                  <span className={addPrefixClass("common__text")}>
                    {sourceTokenSymbol !== "ETH" && (
                      <span>{converter.roundingNumber(converter.toT(sourceBalance, sourceDecimal))} {sourceTokenSymbol}</span>
                    )}

                    {sourceTokenSymbol === "ETH" && (
                      <span>{converter.roundingNumber(converter.toT(ethBalance, 18))} ETH</span>
                    )}
                  </span>
                </div>
              </div>

              <div>
                {this.props.advanceConfig}
              </div>

              {this.getSignerAddresses().length !== 0 && (
                <SignerAddress signerAddresses={this.getSignerAddresses()} translate={this.props.translate}/>
              )}

              <div className={addPrefixClass("widget-exchange__info")}>
                {this.props.account.type === "keystore" && (
                  <div id="import-account">
                    <div className={addPrefixClass("widget-exchange__text theme-text")}>{this.props.translate("common.enter_password") || "Enter your Password"}</div>
                    <div className={addPrefixClass("common__input-panel")}>
                      <input
                        className={addPrefixClass(`common__input theme-border`)}
                        id="passphrase"
                        type={this.state.showPassword ? "text" : "password"}
                        autoFocus
                        autoComplete="off"
                        spellCheck="false"
                        onKeyPress={this.resetPasswordError}
                        onFocus={(e) => this.props.global.analytics.callTrack("clickFocusToInputJSONPws")}
                      />
                      <div className={addPrefixClass("common__input-panel-label small")}>
                        <div className={addPrefixClass(`import-account__eye-icon ${this.state.showPassword ? "unlock" : ""}`)} onClick={this.toogleShowPassword}/>
                      </div>
                    </div>
                    {(this.props.exchange.passwordError) && (
                      <div className={addPrefixClass("common__error box")}>
                        {this.props.exchange.passwordError}
                      </div>
                    )}
                  </div>
                )}

                {this.props.exchange.isNeedApprove && (
                  <div className={addPrefixClass("common__information box")}>
                    {this.props.translate("transaction.approve", { token: this.props.exchange.sourceTokenSymbol }) || `You need to grant permission for KyberWidget to interact with ${this.props.exchange.sourceTokenSymbol} in this address`}
                  </div>
                )}

                {this.props.exchange.isApproveZero && (
                  <div className={addPrefixClass("common__information box")}>
                    {this.props.translate("transaction.approve_zero", { srcSymbol: this.props.exchange.sourceTokenSymbol }) || `You need to grant permission for KyberWidget to reset your previous allowance of ${this.props.exchange.sourceTokenSymbol} since it's insufficient to make the transaction`}
                  </div>
                )}

                {(isConfirming && !isKeystoreOrPrivateKey) && (
                  <div className={addPrefixClass("common__information box")}>
                    {this.props.translate("transaction.tx_waiting") || "Waiting for confirmation from your wallet"}
                  </div>
                )}

                {(isConfirming && isKeystoreOrPrivateKey) && (
                  <div className={addPrefixClass("common__information box")}>
                    {this.props.translate("transaction.tx_sending") || "Sending Transactions"}...
                  </div>
                )}

                {this.getError() && (
                  <div className={addPrefixClass("common__error box")}>{this.getError()}</div>
                )}

                {txError !== "" && (
                  <div className={addPrefixClass("common__error box")}>{txError}</div>
                )}
              </div>
            </div>
            <div className={addPrefixClass("widget-exchange__column-item")}>
              {this.props.detailBox}
            </div>
          </div>
        </div>

        <div className={addPrefixClass("widget-exchange__bot common__flexbox between mobile-column-reverse")}>
          <div className={addPrefixClass(`common__button hollow theme-button ${isConfirming ? "disable" : ""}`)} onClick={this.reImportAccount}>
            {this.props.translate("common.back") || "Back"}
          </div>

          {isApprove && (
            <div className={addPrefixClass("common__button widget-exchange__import theme-gradient" + classDisable)} onClick={this.approveToken}>
              {this.props.translate("common.approve") || "Approve"}
            </div>
          )}

          {!isApprove && (
            <div className={addPrefixClass("common__button widget-exchange__import theme-gradient" + classDisable)} onClick={this.payment}>
              {this.props.translate("common.confirm") || "Confirm"}
            </div>
          )}
        </div>
      </div>
    )
  }
}
