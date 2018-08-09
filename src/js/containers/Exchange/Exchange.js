import React from "react"
import { connect } from "react-redux"
import { ExchangeBody, MinRate, Payment, ErrorPayment } from "../Exchange"
//import {GasConfig} from "../TransactionCommon"
import { AdvanceConfigLayout, GasConfig } from "../../components/TransactionCommon"

import {TransactionLoading} from "../CommonElements"

//import {TransactionLayout} from "../../components/TransactionCommon"
import { getTranslate } from 'react-localize-redux'

import * as converter from "../../utils/converter"
import * as validators from "../../utils/validators"
import * as exchangeActions from "../../actions/exchangeActions"
import { default as _ } from 'underscore'
import { clearSession } from "../../actions/globalActions"

import { ImportAccount } from "../ImportAccount"


//import {HeaderTransaction} from "../TransactionCommon"


@connect((store, props) => {
  //console.log(props)
  // var langs = store.locale.languages
  // const currentLang = langs.map((item) => {
  //   if (item.active) {
  //     return item.code
  //   }
  // })
  const account = store.account.account
  // if (account === false) {
  //   console.log("go to exchange")
  // if (currentLang[0] === 'en') {
  //   window.location.href = "/swap"  
  // } else {
  //   window.location.href = `/swap?lang=${currentLang}`
  // }
  // }
  const translate = getTranslate(store.locale)
  const tokens = store.tokens.tokens
  const exchange = store.exchange
  const ethereum = store.connection.ethereum

  return {
    translate, exchange, tokens, account, ethereum,
    params: { ...props.match.params }, global: store.global

  }
})


export default class Exchange extends React.Component {
  // constructor(props){
  //   super(props)
  //   this.state = {
  //     selectedGas: props.exchange.gasPrice <= 20? "f": "s", 
  //   }
  // }

  // componentDidMount = () =>{
  //   if ((this.props.params.source.toLowerCase() !== this.props.exchange.sourceTokenSymbol.toLowerCase()) || 
  //       (this.props.params.dest.toLowerCase() !== this.props.exchange.destTokenSymbol.toLowerCase()) ){

  //         var sourceSymbol = this.props.params.source.toUpperCase()
  //         var sourceAddress = this.props.tokens[sourceSymbol].address

  //         var destSymbol = this.props.params.dest.toUpperCase()
  //         var destAddress = this.props.tokens[destSymbol].address

  //         this.props.dispatch(exchangeActions.selectTokenAsync(sourceSymbol, sourceAddress, "source", this.props.ethereum))
  //         this.props.dispatch(exchangeActions.selectTokenAsync(destSymbol, destAddress, "des", this.props.ethereum))
  //   }
  // }
  validateTxFee = (gasPrice) => {
    var validateWithFee = validators.verifyBalanceForTransaction(this.props.tokens['ETH'].balance, this.props.exchange.sourceTokenSymbol,
      this.props.exchange.sourceAmount, this.props.exchange.gas + this.props.exchange.gas_approve, gasPrice)

    if (validateWithFee) {
      this.props.dispatch(exchangeActions.thowErrorEthBalance("error.eth_balance_not_enough_for_fee"))
      return
      // check = false
    }
  }
  lazyValidateTransactionFee = _.debounce(this.validateTxFee, 500)

  specifyGas = (event) => {
    var value = event.target.value
    this.props.dispatch(exchangeActions.specifyGas(value))
  }

  specifyGasPrice = (value) => {
    this.props.dispatch(exchangeActions.specifyGasPrice(value + ""))
    if (this.props.account !== false) {
      this.lazyValidateTransactionFee(value)
    }
  }

  inputGasPriceHandler = (value) => {
    // this.setState({selectedGas: "undefined"})
    this.specifyGasPrice(value)
  }

  selectedGasHandler = (value, level) => {

    //this.setState({selectedGas: level})
    this.props.dispatch(exchangeActions.seSelectedGas(level))
    this.specifyGasPrice(value)
  }

  // handleEndSession = () => {
  //   this.props.dispatch(clearSession())
  // }

  render() {
    if (this.props.global.haltPayment){
      return <ErrorPayment />
    }

    if (this.props.exchange.step === 1) {

      var gasPrice = converter.stringToBigNumber(converter.gweiToEth(this.props.exchange.gasPrice))
      var totalGas = gasPrice.multipliedBy(this.props.exchange.gas + this.props.exchange.gas_approve)
      var page = "exchange"
      var gasConfig = (
        <GasConfig
          gas={this.props.exchange.gas + this.props.exchange.gas_approve}
          gasPrice={this.props.exchange.gasPrice}
          maxGasPrice={this.props.exchange.maxGasPrice}
          gasHandler={this.specifyGas}
          inputGasPriceHandler={this.inputGasPriceHandler}
          selectedGasHandler={this.selectedGasHandler}
          gasPriceError={this.props.exchange.errors.gasPriceError}
          gasError={this.props.exchange.errors.gasError}
          translate={this.props.translate}
          gasPriceSuggest={this.props.exchange.gasPriceSuggest}
          selectedGas={this.props.exchange.selectedGas}
          page={page}
        />
      )

      var minRate = <MinRate />
      //if (this.props.exchange.sourceTokenSymbol !== this.props.exchange.destTokenSymbol){
        // minRate = <MinRate />
      //}

      var advanceConfig = <AdvanceConfigLayout totalGas={totalGas.toString()} minRate={minRate} gasConfig={gasConfig} translate={this.props.translate} />
      var exchangeBody = <ExchangeBody advanceLayout={advanceConfig} />

      // var headerTransaction = <HeaderTransaction page="exchange" />

      return (
        <div class="frame exchange-frame">
          <div className="row">
            {exchangeBody}
          </div>
        </div>
      )
    }

    if (this.props.exchange.step === 2) {
      return <ImportAccount screen="exchange" />
    }

    if (this.props.exchange.step === 3) {
      return <Payment />
    }
    if (this.props.exchange.step === 4) {
          return  <TransactionLoading
        tx={this.props.exchange.txHash}
        //tempTx={this.props.exchange.tempTx}
        //makeNewTransaction={this.makeNewExchange}
    //    type="exchange"
        //balanceInfo={balanceInfo}
        broadcasting={this.props.exchange.broadcasting}
        broadcastingError={this.props.exchange.broadcastError}
        //analyze={analyze}
        //isOpen={this.props.exchange.step === 3}
      />
    }
  }
}
