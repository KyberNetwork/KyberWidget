import React from "react"
import { connect } from "react-redux"
import { NotifyView } from "../../components/Header"
import { clearTxs } from "../../actions/txActions"
import { analyzeError } from "../../actions/exchangeActions"
import { getTranslate } from 'react-localize-redux';

@connect((store) => {
    return {
        txs: store.txs,
        utils: store.utils,
        translate: getTranslate(store.locale),
        ethereum: store.connection.ethereum,
    }
})

export default class Notify extends React.Component {

    displayTransactions = () => {
        
        if (Object.keys(this.props.txs).length > 0) {
            this.props.dispatch(clearTxs());
        }
    }

    handleAnalyzeError = (txHash) => {
        this.props.dispatch(analyzeError(this.props.ethereum, txHash))
    }

    render() {
        return (
            <NotifyView
                displayTransactions={this.displayTransactions}
                transactionsNum={Object.keys(this.props.txs).length}
                txs={this.props.txs}
                translate={this.props.translate}
                handleAnalyze={this.handleAnalyzeError.bind(this)}
            />
        )
    }
}
