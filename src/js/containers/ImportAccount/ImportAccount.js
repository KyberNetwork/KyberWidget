import React from "react"
import { connect } from "react-redux"
import { ImportAccountView } from '../../components/ImportAccount'
import { ImportByMetamask} from "../ImportAccount"
import { getTranslate } from 'react-localize-redux'
import { importAccountMetamask, openImportAccount, closeImportAccount } from "../../actions/accountActions"
import BLOCKCHAIN_INFO from "../../../../env"
import Web3Service from "../../services/web3"
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
    network: store.exchange.network
  }
})

export default class ImportAccount extends React.Component {
  componentDidMount = () => {
    // var swapPage = document.getElementById("swap-app")
    // swapPage.className = swapPage.className === "" ? "no-min-height" : swapPage.className + " no-min-height"

    if (this.props.termOfServiceAccepted){
      if (typeof web3 !== "undefined") {
        var web3Service = new Web3Service(web3)
        var walletType = web3Service.getWalletType()
        if (walletType !== "metamask") {
          this.props.dispatch(importAccountMetamask(web3Service, BLOCKCHAIN_INFO[this.props.network].networkId))
        }
      }
    }
  }

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
  }

  closeImportAccount() {
    this.props.dispatch(closeImportAccount());
  }

  backToFirstStep() {
    this.props.dispatch(goToStep(1));
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
