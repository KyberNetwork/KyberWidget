import React from "react"
import { connect } from "react-redux"
import { ImportAccountView } from '../../components/ImportAccount'
import { ImportByMetamask} from "../ImportAccount"
import { getTranslate } from 'react-localize-redux'
import { openImportAccount, closeImportAccount } from "../../actions/accountActions"
import { goToStep } from "../../actions/exchangeActions"

@connect((store, props) => {
  var tokens = store.tokens.tokens;
  var supportTokens = [];

  Object.keys(tokens).forEach((key) => {
    supportTokens.push(tokens[key])
  })
  
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
  getSignerAddresses = ()  => {
    if (!this.props.exchange.signer) {
      return [];
    }

    let addresses = this.props.exchange.signer.split("_")

    return addresses.filter(function(item, pos) {
      return addresses.indexOf(item) == pos
    })
  }

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

  render() {
    return (
      <div id="landing_page">
        <ImportAccountView
          isLoading={this.props.loading}
          firstKey={<ImportByMetamask screen={this.props.screen}/>}
          signerAddresses={this.getSignerAddresses()}
          onOpenImportAccount={this.openImportAccount.bind(this)}
          onCloseImportAccount={this.closeImportAccount.bind(this)}
          chosenImportAccount={this.props.chosenImportAccount}
          backToFirstStep={this.backToFirstStep.bind(this)}
          translate={this.props.translate}
          screen={this.props.screen}
          error={this.props.error}
        />
      </div>
    )
  }
}
