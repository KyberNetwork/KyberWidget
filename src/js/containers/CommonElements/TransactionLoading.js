import React from "react"
import { connect } from "react-redux"
import { TransactionLoadingView } from "../../components/Transaction"
import { getTranslate } from 'react-localize-redux'

@connect((store, props) => {
  var returnProps = {}
  if (props.broadcasting) {
    returnProps = {
      broadcasting: true,
      error: ""
    }
  } else if (props.broadcastingError !== "") {
    returnProps = { broadcasting: true, error: props.broadcastingError }
  } else {
    returnProps = {
      broadcasting: false,
      txHash: props.tx,
    }
  }
  return {
    ...returnProps,
    translate: getTranslate(store.locale),
    network: store.exchange.network,
    analytics: store.global.analytics,
    exchange: store.exchange
  }
})

export default class TransactionLoading extends React.Component {
  constructor() {
    super();
    this.state = {
      isCopied: false,
    }
  }

  handleCopy() {
    this.setState({
      isCopied: true
    })
    this.props.analytics.callTrack("copyTx")
  }

  resetCopy(){
    this.setState({
      isCopied: false
    })
  }

  render() {
    return (
      <TransactionLoadingView
        exchange={this.props.exchange}
        broadcasting={this.props.broadcasting}
        error={this.props.error}
        txHash={this.props.txHash}
        translate={this.props.translate}
        isCopied={this.state.isCopied}
        handleCopy={this.handleCopy.bind(this)}
        resetCopy={this.resetCopy.bind(this)}
        network = {this.props.network}
        analytics = {this.props.analytics}
      />
    )
  }
}
