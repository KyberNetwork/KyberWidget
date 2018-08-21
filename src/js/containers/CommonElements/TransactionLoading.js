import React from "react"
import { connect } from "react-redux"
import { push } from 'react-router-redux';
import constants from "../../services/constants"
import { TransactionLoadingView } from "../../components/Transaction"
import { getTranslate } from 'react-localize-redux'
import * as exchangeActions from "../../actions/exchangeActions"
import * as transferActions from "../../actions/transferActions"
import { Modal } from "../../components/CommonElement"


@connect((store, props) => {
    // var type = props.type
    // var isOpen = false
    // if (props.type === "exchange"){
    //     isOpen = store.exchange.step === 3
    // }
    // if (props.type === "transfer"){
    //     isOpen = store.transfer.step === 3
    // }
    
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
         //   ...props.tempTx,
            broadcasting: false,
         //   makeNewTransaction: props.makeNewTransaction,
        //    type: props.type,
        //    balanceInfo: props.balanceInfo,
            txHash: props.tx,
         //   analyze: props.analyze,
          //  address: props.address,
         //   isOpen: props.isOpen,
        }
    }
    return { ...returnProps, translate: getTranslate(store.locale), network: store.exchange.network }
})

export default class TransactionLoading extends React.Component {

    constructor() {
        super();
        this.state = {
         //   isOpenModal: false,
            isCopied: false,
        }
    }

    // toogleModal() {
    //     this.setState({
    //         isOpenModal: !this.state.isOpenModal
    //     })
    // }

    handleCopy() {
        this.setState({
            isCopied: true
        })
    }

    resetCopy(){
        this.setState({
            isCopied: false
        })
    }

    // closeModal = () => {
    //    this.props.makeNewTransaction()
    // }

    render() {
      return <TransactionLoadingView
        broadcasting={this.props.broadcasting}
        error={this.props.error}
        txHash={this.props.txHash}
        translate={this.props.translate}
        isCopied={this.state.isCopied}
        handleCopy={this.handleCopy.bind(this)}
        resetCopy={this.resetCopy.bind(this)}
        network = {this.props.network}
      />
    }
}
