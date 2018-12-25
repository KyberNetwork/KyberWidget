import React from "react"
import { connect } from "react-redux"
import { ExchangeBody, Payment, ErrorPayment } from "../Exchange"
import { AdvanceConfigLayout } from "../../components/TransactionCommon"
import {TransactionLoading} from "../CommonElements"
import { getTranslate } from 'react-localize-redux'
import * as converter from "../../utils/converter"
import * as validators from "../../utils/validators"
import * as exchangeActions from "../../actions/exchangeActions"
import { default as _ } from 'underscore'
import { ImportAccount } from "../ImportAccount"
import OrderDetails from "../../components/CommonElement/OrderDetails";
import TransactionDetails from "../../components/CommonElement/TransactionDetails";

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
  constructor() {
    super();

    this.state = {
      isAdvConfigActive: false
    }
  }

  toggleAdvConfig = () => {
    this.setState({isAdvConfigActive: !this.state.isAdvConfigActive});
    this.props.global.analytics.callTrack("clickToAdvance", this.state.isAdvConfigActive);
  };

  validateTxFee = (gasPrice) => {
    var validateWithFee = validators.verifyBalanceForTransaction(this.props.tokens['ETH'].balance, this.props.exchange.sourceTokenSymbol,
      this.props.exchange.sourceAmount, this.props.exchange.gas + this.props.exchange.gas_approve, gasPrice)

    if (validateWithFee) {
      this.props.dispatch(exchangeActions.thowErrorEthBalance("error.eth_balance_not_enough_for_fee"))
      return
    }
  };

  lazyValidateTransactionFee = _.debounce(this.validateTxFee, 500)

  specifyGasPrice = (value) => {
    this.props.dispatch(exchangeActions.specifyGasPrice(value))
    if (this.props.account !== false) {
      this.lazyValidateTransactionFee(value)
    }
  };

  handleGasChanged = (value, level, levelString) => {
    this.props.dispatch(exchangeActions.setSnapshotGasPrice(value));
    this.props.dispatch(exchangeActions.seSelectedGas(level));
    this.specifyGasPrice(value);
    this.props.global.analytics.callTrack("chooseGas", levelString, value);
  };

  handleSlippageRateChanged = (e, isInput = false) => {
    const offeredRate  = this.props.exchange.offeredRate;
    const maxValue = 100;
    let minValue = this.props.exchange.type === "pay" ? 10 : 0;
    let value = isInput ? maxValue - e.currentTarget.value : e.currentTarget.value;

    if (value > maxValue) {
      value = maxValue;
    } else if (value < minValue) {
      value = minValue;
    }

    const minRate = converter.caculatorRateToPercentage(value, offeredRate);

    this.props.dispatch(exchangeActions.setMinRate(minRate.toString()));
    this.props.dispatch(exchangeActions.setSnapshotMinConversionRate(minRate.toString()));
    this.props.global.analytics.callTrack("setNewMinRate", value);
  };

  renderOrderDetailComponent = () => {
    let symbol, amount, tokenEthRate, tokenRateToEth;

    if (this.props.exchange.type !== "pay") {
      symbol = this.props.exchange.sourceTokenSymbol;
      amount = this.props.exchange.sourceAmount;
    } else {
      symbol = this.props.exchange.destTokenSymbol;
      amount = this.props.exchange.destAmount;
    }

    tokenEthRate = converter.toT(this.props.tokens[symbol].rateEth, 18);
    tokenRateToEth = tokenEthRate ? parseFloat((amount / tokenEthRate).toFixed(4)) : 0;

    return (
      <OrderDetails
        tokenRateToEth={tokenRateToEth}
        exchange={this.props.exchange}
        global={this.props.global}
        translate={this.props.translate}
      />
    );
  };

  render() {
    let detailBox = <TransactionDetails exchange={this.props.exchange}/>;

    if (this.props.exchange.type === "pay") {
      detailBox = this.renderOrderDetailComponent();
    }

    if (this.props.global.haltPayment){
      return <ErrorPayment/>
    }

    if (this.props.exchange.step === 1) {
      return <ExchangeBody detailBox={detailBox}/>;
    }

    if (this.props.exchange.step === 2) {
      return <ImportAccount screen="exchange" detailBox={detailBox}/>
    }

    if (this.props.exchange.step === 3) {
      const advanceConfig = (
        <AdvanceConfigLayout
          isAdvConfigActive={this.state.isAdvConfigActive}
          toggleAdvConfig={this.toggleAdvConfig}
          exchange={this.props.exchange}
          onSlippageRateChanged={this.handleSlippageRateChanged}
          handleGasChanged={this.handleGasChanged}
          translate={this.props.translate}
          analytics={this.props.global.analytics}
        />
      );

      return <Payment advanceConfig={advanceConfig} detailBox={detailBox}/>
    }

    if (this.props.exchange.step === 4) {
      return  (
        <TransactionLoading
          tx={this.props.exchange.txHash}
          broadcasting={this.props.exchange.broadcasting}
          broadcastingError={this.props.exchange.broadcastError}
        />
      )
    }
  }
}
