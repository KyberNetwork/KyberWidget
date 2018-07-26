import React from "react"
import { connect } from "react-redux"
import { ImportAccountView } from '../../components/ImportAccount'
import { ImportKeystore, ImportByMetamask} from "../ImportAccount"
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
    translate: getTranslate(store.locale),
    isVisitFirstTime: store.global.isVisitFirstTime,
    translate: getTranslate(store.locale),
    termOfServiceAccepted: store.global.termOfServiceAccepted,
    ethereum: store.connection.ethereum,
    tokens: supportTokens,
    exchange: store.exchange,
    screen: props.screen
  }
})

export default class ImportAccount extends React.Component {
  componentDidMount = () => {
    var swapPage = document.getElementById("swap-app")
    swapPage.className = swapPage.className === "" ? "no-min-height" : swapPage.className + " no-min-height"

    if (this.props.termOfServiceAccepted){
      if (typeof web3 !== "undefined") {
        var web3Service = new Web3Service(web3)
        var walletType = web3Service.getWalletType()
        if (walletType !== "metamask") {
          this.props.dispatch(importAccountMetamask(web3Service, BLOCKCHAIN_INFO.networkId,
          this.props.ethereum, this.props.tokens, this.props.screen, this.props.translate, walletType))
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
          secondKey={<ImportKeystore screen={this.props.screen}/>}
          signerAddresses={this.getSignerAddresses()}
          onOpenImportAccount={this.openImportAccount.bind(this)}
          onCloseImportAccount={this.closeImportAccount.bind(this)}
          choosenImportAccount={this.props.choosenImportAccount}
          backToFirstStep={this.backToFirstStep.bind(this)}
          translate={this.props.translate}
          screen={this.props.screen}
        />
      </div>
    )
  }
}
