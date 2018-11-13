import React from "react"
import { connect } from "react-redux"
import { ExchangeBody, MinRate, Payment, ErrorPayment } from "../Exchange"
import { AdvanceConfigLayout, GasConfig } from "../../components/TransactionCommon"
import {TransactionLoading} from "../CommonElements"
import { getTranslate } from 'react-localize-redux'
import * as converter from "../../utils/converter"
import * as validators from "../../utils/validators"
import * as exchangeActions from "../../actions/exchangeActions"
import { default as _ } from 'underscore'
import { ImportAccount } from "../ImportAccount"
import {addPrefixClass} from "../../utils/className"

@connect((store, props) => {
  const account = store.account.account
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
    this.props.dispatch(exchangeActions.seSelectedGas(level))
    this.specifyGasPrice(value)
  }

  getMaxGasApprove = () => {
    const sourceTokenSymbol = this.props.exchange.sourceTokenSymbol;
    const gasApprove = this.props.tokens[sourceTokenSymbol] ? this.props.tokens[sourceTokenSymbol].gasApprove : false;

    return gasApprove ? gasApprove : 100000;
  }

  render() {
    if (this.props.global.haltPayment){
      return <ErrorPayment />
    }

    if (this.props.exchange.step === 1) {

      var gasPrice = converter.stringToBigNumber(converter.gweiToEth(this.props.exchange.gasPrice))
      var totalGas = gasPrice.multipliedBy(this.props.exchange.gas + this.getMaxGasApprove())
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
          analytics={this.props.global.analytics}
        />
      )

      var minRate = <MinRate />
      var advanceConfig = <AdvanceConfigLayout totalGas={totalGas.toString()} minRate={minRate} gasConfig={gasConfig} translate={this.props.translate} analytics={this.props.global.analytics}/>
      var exchangeBody = <ExchangeBody advanceLayout={advanceConfig} />

      return (
        <div className={addPrefixClass("k-frame exchange-frame")}>
          <div className={addPrefixClass("row")}>
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
        broadcasting={this.props.exchange.broadcasting}
        broadcastingError={this.props.exchange.broadcastError}
      />
    }
  }
}
