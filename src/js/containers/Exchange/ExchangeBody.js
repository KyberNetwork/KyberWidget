import React from "react"
import { connect } from "react-redux"
import { push } from 'react-router-redux';

//import  from "../../utils/converter"

import { PostExchangeWithKey, MinRate, AccountBalance } from "../Exchange"
import { TransactionConfig } from "../../components/Transaction"

import { ExchangeBodyLayout }  from "../../components/Exchange"
import { AddressBalance }  from "../../components/TransactionCommon"

import { TransactionLoading, Token } from "../CommonElements"

import { TokenSelector } from "../TransactionCommon"

import * as validators from "../../utils/validators"
import * as common from "../../utils/common"
import * as converter from "../../utils/converter"

import { openTokenModal, hideSelectToken } from "../../actions/utilActions"

import * as globalActions from "../../actions/globalActions"

import * as exchangeActions from "../../actions/exchangeActions"

import constansts from "../../services/constants"

//import { randomForExchange } from "../../utils/random"
import { getTranslate } from 'react-localize-redux'
import { default as _ } from 'underscore'

@connect((store, props) => {

  const langs = store.locale.languages
  var currentLang = common.getActiveLanguage(langs)

  const ethereum = store.connection.ethereum
  const account = store.account
  const exchange = store.exchange
  const tokens = store.tokens.tokens
  const translate = getTranslate(store.locale)

  var sourceTokenSymbol = store.exchange.sourceTokenSymbol
  var sourceBalance = 0
  var sourceDecimal = 18
  var sourceName = "Ether"
  var rateSourceToEth = 0
  if (tokens[sourceTokenSymbol]) {
    sourceBalance = tokens[sourceTokenSymbol].balance
    sourceDecimal = tokens[sourceTokenSymbol].decimal
    sourceName = tokens[sourceTokenSymbol].name
    rateSourceToEth = tokens[sourceTokenSymbol].rate
  }

  var destTokenSymbol = store.exchange.destTokenSymbol
  var destBalance = 0
  var destDecimal = 18
  var destName = "Kybernetwork"
  if (tokens[destTokenSymbol]) {
    destBalance = tokens[destTokenSymbol].balance
    destDecimal = tokens[destTokenSymbol].decimal
    destName = tokens[destTokenSymbol].name
  }

  return {
    account, ethereum, tokens, translate, currentLang, 
    global: store.global,
    exchange: {
      ...store.exchange, sourceBalance, sourceDecimal, destBalance, destDecimal,
      sourceName, destName, rateSourceToEth,
      advanceLayout : props.advanceLayout      
    }
  }
})


export default class ExchangeBody extends React.Component {
  constructor(){
    super()
    this.state = {
      focus : "",
      acceptedTerm: false
    }
  }


  acceptedTerm = () => {
    var checked = document.getElementById('term-agree').checked
    // console.log("term_value")
    // console.log(checked)console.log("term_value")
    // console.log(checked)
    if (checked){
      this.setState({acceptedTerm: true})
    }else{
      this.setState({acceptedTerm: false})
    }
    
  }

  importAccount = () =>{    
    
    if (!this.state.acceptedTerm){
      return
    }

    var isValidate = true
    //validate errors

    if (!this.props.exchange.kyber_enabled){
      this.props.dispatch(exchangeActions.thowErrorSourceAmount("Kyber swap is not enabled"))
      isValidate = false
    }

    var srcAmount
    var sourceAmountIsNumber = true
    if (!this.props.exchange.isHaveDestAmount){
      srcAmount = parseFloat(this.props.exchange.sourceAmount)
      if (isNaN(srcAmount)) {
        this.props.dispatch(exchangeActions.thowErrorSourceAmount("error.source_amount_is_not_number"))
        isValidate = false
        sourceAmountIsNumber = false
      }          
    }else{
      if (this.props.exchange.sourceTokenSymbol === this.props.exchange.destTokenSymbol){
        srcAmount = this.props.exchange.destAmount
      }else{
        srcAmount = converter.caculateSourceAmount(this.props.exchange.destAmount, this.props.exchange.offeredRate, 6)        
      }
    }

    if (sourceAmountIsNumber){
      if (this.props.exchange.sourceTokenSymbol !== "ETH"){
        srcAmount = converter.calculateDest(srcAmount, this.props.exchange.rateSourceToEth, 6)
      }
      // console.log("converter_sourceamount")
      // console.log(srcAmount)
      if (parseFloat(srcAmount) < parseFloat(converter.toEther(constansts.EPSILON))){
        var minAmount = converter.toEther(constansts.EPSILON)
        this.props.dispatch(exchangeActions.thowErrorSourceAmount(this.props.translate("error.source_amount_too_small", {minAmount: minAmount}) || `Source amount is too small. Minimum amount is ${minAmount} ETH equivalent.`))
        isValidate = false
      }
    }

    

    var gasPrice = parseFloat(this.props.exchange.gasPrice)
    if (isNaN(gasPrice)) {
      this.props.dispatch(exchangeActions.throwErrorExchange("gasPriceError", this.props.translate("error.gas_price_not_number") || "Gas price is not number"))
      isValidate = false
    }else {
      if (gasPrice > this.props.exchange.maxGasPrice) {
        this.props.dispatch(exchangeActions.throwErrorExchange("gasPriceError", this.props.translate("error.gas_price_limit", {maxGas: this.props.exchange.maxGasPrice }) || "Gas price exceeds limit"))
        //this.props.dispatch(exchangeActions.thowErrorGasPrice("error.gas_price_limit"))
        isValidate = false
      }
    }

    if (!isValidate){
      return
    }

    this.props.dispatch(exchangeActions.goToStep(2))

    //set snapshot
    this.props.dispatch(exchangeActions.setSnapshot(this.props.exchange))
    this.props.dispatch(exchangeActions.updateRateSnapshot(this.props.ethereum))
  }

  chooseToken = (symbol, address, type) => {
    this.props.dispatch(exchangeActions.selectTokenAsync(symbol, address, type, this.props.ethereum))
  }

  dispatchUpdateRateExchange = (sourceValue) => {
    var sourceDecimal = 18
    var sourceTokenSymbol = this.props.exchange.sourceTokenSymbol
    
    if (sourceTokenSymbol === "ETH"){
      if(parseFloat(sourceValue) > constansts.MAX_AMOUNT_RATE_HANDLE){
        this.props.dispatch(exchangeActions.throwErrorHandleAmount())
        return 
      }
    }else{
      var destValue = converter.caculateDestAmount(sourceValue, this.props.exchange.rateSourceToEth, 6)
      if(parseFloat(destValue) > constansts.MAX_AMOUNT_RATE_HANDLE){
        this.props.dispatch(exchangeActions.throwErrorHandleAmount())
        return 
      }
    }
    //var minRate = 0
    var tokens = this.props.tokens
    if (tokens[sourceTokenSymbol]) {
      sourceDecimal = tokens[sourceTokenSymbol].decimal
      //minRate = tokens[sourceTokenSymbol].minRate
    }

    var ethereum = this.props.ethereum
    var source = this.props.exchange.sourceToken
    var dest = this.props.exchange.destToken
    var destTokenSymbol = this.props.exchange.destTokenSymbol


    this.props.dispatch(exchangeActions.updateRateExchange(source, dest, sourceValue, sourceTokenSymbol, true))
  }

  lazyUpdateRateExchange = _.debounce(this.dispatchUpdateRateExchange, 500)

 
  validateRateAndSource = (sourceValue) => {
    this.lazyUpdateRateExchange(sourceValue)
  }

  changeSourceAmount = (e) => {
    var value = e.target.value
    if (value < 0) return
    this.props.dispatch(exchangeActions.inputChange('source', value));

    this.validateRateAndSource(value)
  }

  changeDestAmount = (e) => {
    var value = e.target.value
    if (value < 0) return
    this.props.dispatch(exchangeActions.inputChange('dest', value))

    var valueSource = converter.caculateSourceAmount(value, this.props.exchange.offeredRate, 6)
    this.validateRateAndSource(valueSource)
  }

  focusSource = () => {
    this.props.dispatch(exchangeActions.focusInput('source'));
    this.setState({focus:"source"})
  }

  blurSource = () => {
    this.setState({focus:""})
  }

  focusDest = () => {
    this.props.dispatch(exchangeActions.focusInput('dest'));
    this.setState({focus:"dest"})
  }

  blurDest = () => {
    this.setState({focus:""})
  }

  makeNewExchange = () => {
    this.props.dispatch(exchangeActions.makeNewExchange());
  }

  analyze = () => {
    var ethereum = this.props.ethereum
    var exchange = this.props.exchange
    //var tokens = this.props.tokens
    this.props.dispatch(exchangeActions.analyzeError(ethereum, exchange.txHash))
  }

  render() {
    //--------For select token
    var tokenDest = {}
    var isNotSupport = false
    Object.keys(this.props.tokens).map((key, i) => {
      isNotSupport = false
      if (this.props.exchange.sourceTokenSymbol === key) {
        isNotSupport = true
      }
      if (this.props.exchange.sourceTokenSymbol !== "ETH" && key !== "ETH") {
        isNotSupport = true
      }
      tokenDest[key] = { ...this.props.tokens[key], isNotSupport: isNotSupport }
    })

    var tokenSourceSelect = (
      <TokenSelector type="source"
        focusItem={this.props.exchange.sourceTokenSymbol}
        listItem={this.props.tokens}
        chooseToken={this.chooseToken}
      />
    )
    //--------End

    var errors = {
      selectSameToken: this.props.exchange.errors.selectSameToken || '',
      selectTokenToken: this.props.exchange.errors.selectTokenToken || '',
      sourceAmount: this.props.exchange.errors.sourceAmountError || this.props.exchange.errors.ethBalanceError || '',
      tokenSource: '',
      rateSystem: this.props.exchange.errors.rateSystem,
      rateAmount : this.props.exchange.errors.rateAmount,
      notPossessKgt: this.props.exchange.errors.notPossessKgt,
      exchange_enable: this.props.exchange.errors.exchange_enable
    }

    var input = {
      sourceAmount: {
        type: 'number',
        value: this.props.exchange.sourceAmount,
        onChange: this.changeSourceAmount,
        onFocus: this.focusSource,
        onBlur: this.blurSource
      },
      destAmount: {
        type: 'number',
        value: this.props.exchange.destAmount,
        onChange: this.changeDestAmount,
        onFocus: this.focusDest,
        onBlur: this.blurDest
      }
    }

    var exchangeButton = (
      <PostExchangeWithKey />
    )


    var addressBalance = ""
    var token = this.props.tokens[this.props.exchange.sourceTokenSymbol]
    if (token) {
      addressBalance = {
        value: converter.toT(token.balance, token.decimal),
        roundingValue: converter.roundingNumber(converter.toT(token.balance, token.decimal))
      }
    }

    var accountBalance = ""
    if (this.props.account.account !== false){      
      accountBalance = <AccountBalance 
      chooseToken = {this.chooseToken}
    />
    }

    // console.log("is_select_token")
    // console.log(this.props.exchange.isSelectToken)
    var classNamePaymentbtn
    if (!validators.anyErrors(this.props.exchange.errors) && this.state.acceptedTerm && !this.props.exchange.isSelectToken) {
      //className += " animated infinite pulse next"
      classNamePaymentbtn = "button accent next"
    }else{
      classNamePaymentbtn = "button accent disable"
    }

    return (
      <ExchangeBodyLayout step={this.props.exchange.step}
        tokenSourceSelect={tokenSourceSelect}
        errors={errors}
        input={input}
        sourceTokenSymbol={this.props.exchange.sourceTokenSymbol}
        destTokenSymbol = {this.props.exchange.destTokenSymbol}
        translate={this.props.translate}
        swapToken={this.swapToken}
        maxCap={converter.toEther(this.props.exchange.maxCap)}
        errorNotPossessKgt={this.props.exchange.errorNotPossessKgt}
        advanceLayout = {this.props.advanceLayout}
        balanceList = {accountBalance}
        focus = {this.state.focus}
        networkError ={this.props.global.network_error}
        exchange = {this.props.exchange}
        importAccount = {this.importAccount}
        acceptedTerm = {this.acceptedTerm}
        classNamePaymentbtn = {classNamePaymentbtn}
        global = {this.props.global}
      />
    )
  }
}
