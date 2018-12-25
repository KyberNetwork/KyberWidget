import React from "react"
import { connect } from "react-redux"
import ImportByPKeyContent from "../../components/ImportAccount/PrivateKey/ImportByPKeyContent"
import { pKeyChange } from "../../actions/accountActions"
import { getTranslate } from 'react-localize-redux';

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
  constructor(props) {
    super(props);

    this.state = {
      showPassword: false
    }
  }

  toggleShowPw() {
    this.setState({showPassword: !this.state.showPassword});
    this.props.analytics.callTrack("clickShowPassword");
  }

  inputChange(e) {
    var value = e.target.value
    this.props.dispatch(pKeyChange(value));
  }

  render() {
    return (
      <ImportByPKeyContent
        onChange={this.inputChange.bind(this)}
        onToggleShowPw={this.toggleShowPw.bind(this)}
        pKeyError={this.props.account.pKey.error}
        translate={this.props.translate}
        analytics={this.props.analytics}
        showPassword={this.state.showPassword}
      />
    )
  }
}
