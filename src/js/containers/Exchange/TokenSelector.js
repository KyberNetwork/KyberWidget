import React from "react"
import { connect } from "react-redux"
import { TokenSelectorView } from '../../components/CommonElement'
import { getTranslate } from 'react-localize-redux';

@connect((store, props) => {
  return {
    account: store.account.account,
    focusItem: props.focusItem,
    listItem: props.listItem,
    
    chooseToken: props.chooseToken,
    translate: getTranslate(store.locale),
    exchange: store.exchange,
    tokens: store.tokens.tokens,
    analytics: store.global.analytics
  }
})

export default class TokenSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      searchWord: "",
    }
  }

  changeWord = (e) => {
    var value = e.target.value.toLowerCase()
    this.setState({ searchWord: value })
  };

  showTokens = (e) => {
    this.setState({ open: true })
    this.props.analytics.callTrack("clickTokenSelector", true)
  };

  hideTokens = (e) => {
    this.setState({ open: false })
    this.props.analytics.callTrack("clickTokenSelector", false)
  };

  selectItem = (event, symbol, address, suggest) => {
    this.props.chooseToken(symbol, address, this.props.type);
    this.hideTokens(event);
    if (suggest === "suggest") {
      this.props.analytics.callTrack("chooseSuggestToken", symbol, this.props.type)
    } else {
      this.props.analytics.callTrack("chooseToken", symbol, this.props.type)
    }
  };

  render() {
    return (
      <TokenSelectorView
        open={this.state.open}
        searchWord={this.state.searchWord}
        listItem={this.props.listItem}
        focusItem={this.props.focusItem}
        changeWord={this.changeWord}
        selectItem={this.selectItem}
        translate={this.props.translate}
        showTokens = {this.showTokens}
        hideTokens = {this.hideTokens}
        account = {this.props.account}
        exchange = {this.props.exchange}
        tokens = {this.props.tokens}
        analytics = {this.props.analytics}
      />
    )
  }
}
