import React from "react"
import { connect } from "react-redux"
import ImportByPKeyContent from "../../components/ImportAccount/PrivateKey/ImportByPKeyContent"
import { importNewAccount, throwError, pKeyChange, throwPKeyError, openImportAccount } from "../../actions/accountActions"
import { addressFromPrivateKey } from "../../utils/keys"
import { getTranslate } from 'react-localize-redux';
import { addPrefixClass } from "../../utils/className";

@connect((store) => {
  var tokens = store.tokens.tokens;
  var supportTokens = [];
  Object.keys(tokens).forEach((key) => {
    supportTokens.push(tokens[key])
  });

  return {
    account: store.account,
    ethereum: store.connection.ethereum,
    tokens: supportTokens,
    translate: getTranslate(store.locale),
    analytics: store.global.analytics
  }
})

export default class ImportByPrivateKey extends React.Component {
  constructor() {
    super()
    this.state = {
      showPassword: false
    }
  }

  handleSubmit() {
    let privateKey = document.getElementById("private_key").value;
    this.importPrivateKey(privateKey);
  }

  submit(e) {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  toggleShowPw() {
    this.setState({showPassword : !this.state.showPassword})
    this.props.analytics.callTrack("clickShowPassword", this.state.showPassword ? "show" : "hide")
  }

  inputChange(e) {
    var value = e.target.value
    this.props.dispatch(pKeyChange(value));
  }

  importPrivateKey(privateKey) {
    try {
      if (privateKey.match(/^0[x | X].{3,}$/)) {
        privateKey = privateKey.substring(2)
      }
      let address = addressFromPrivateKey(privateKey)
      this.props.dispatch(importNewAccount(address,
          "privateKey",
          privateKey))
    }
    catch (e) {
      console.log(e)
      this.props.dispatch(throwPKeyError(this.props.translate("error.invalid_private_key") || 'Invalid private key'))
    }
  }

  render() {
    return (
      <ImportByPKeyContent
        onChange={this.inputChange.bind(this)}
        onHandleSubmit={this.handleSubmit.bind(this)}
        onCloseImportAccount={this.props.onCloseImportAccount}
        onSubmit={this.submit}
        showPassword={this.state.showPassword}
        onToggleShowPw={this.toggleShowPw.bind(this)}
        pKeyError={this.props.account.pKey.error}
        translate={this.props.translate}
        analytics={this.props.analytics}
      />
    )
  }
}
