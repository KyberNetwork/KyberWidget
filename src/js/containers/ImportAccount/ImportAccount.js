import React from "react"
import { connect } from "react-redux"
import { ImportAccountView } from '../../components/ImportAccount'
import { getTranslate } from 'react-localize-redux'
import {openImportAccount, closeImportAccount, importNewAccount, throwPKeyError} from "../../actions/accountActions"
import { goToStep } from "../../actions/exchangeActions"
import { addressFromPrivateKey } from "../../utils/keys"

@connect((store, props) => {
  var tokens = store.tokens.tokens;
  var supportTokens = [];

  Object.keys(tokens).forEach((key) => {
    supportTokens.push(tokens[key])
  });
  
  return {
    ...store.account,
    isVisitFirstTime: store.global.isVisitFirstTime,
    translate: getTranslate(store.locale),
    termOfServiceAccepted: store.global.termOfServiceAccepted,
    ethereum: store.connection.ethereum,
    tokens: supportTokens,
    exchange: store.exchange,
    screen: props.screen,
    network: store.exchange.network,
    analytics: store.global.analytics
  }
})

export default class ImportAccount extends React.Component {
  openImportAccount(type) {
    this.props.dispatch(openImportAccount(type));
    this.props.analytics.callTrack("clickToImportAccount", type)
  }

  closeImportAccount() {
    console.log("close import: ", this.props.analytics)
    this.props.dispatch(closeImportAccount());
    this.props.analytics.callTrack("clickBackToImportScreen")
  }

  backToFirstStep() {
    this.props.dispatch(goToStep(1));
    this.props.analytics.callTrack("clickToBack", 1)
  }

  handleSubmitPrivateKey() {
    let privateKey = document.getElementById("private_key").value;

    try {
      if (privateKey.match(/^0[x | X].{3,}$/)) {
        privateKey = privateKey.substring(2)
      }
      let address = addressFromPrivateKey(privateKey)
      this.props.dispatch(importNewAccount(address, "privateKey", privateKey))
    }
    catch (e) {
      this.props.dispatch(throwPKeyError(this.props.translate("error.invalid_private_key") || 'Invalid private key'))
    }
  }

  handleImportDevice() {
    this.props.dispatch(importNewAccount(
      this.props.wallet.address,
      this.props.wallet.type,
      this.props.wallet.dPath + '/' + this.props.wallet.index
    ))
  }

  render() {
    return (
      <ImportAccountView
        exchangeType={this.props.exchange.type}
        isLoading={this.props.loading}
        onOpenImportAccount={this.openImportAccount.bind(this)}
        onCloseImportAccount={this.closeImportAccount.bind(this)}
        chosenImportAccount={this.props.chosenImportAccount}
        backToFirstStep={this.backToFirstStep.bind(this)}
        translate={this.props.translate}
        screen={this.props.screen}
        error={this.props.error}
        detailBox={this.props.detailBox}
        handleSubmitPrivateKey={this.handleSubmitPrivateKey.bind(this)}
        handleImportDevice={this.handleImportDevice.bind(this)}
      />
    )
  }
}
