import React from "react"
import { connect } from "react-redux"
import { Exchange } from "../../containers/Exchange"
import {PaymentHeader} from "../../components/Header";
import constant from "../../services/constants"
import history from "../../history"
import { clearSession, changeLanguage } from "../../actions/globalActions"
import { openInfoModal } from "../../actions/utilActions"
import { default as _ } from 'underscore';
import { LayoutView } from "../../components/Layout"
import { getTranslate } from 'react-localize-redux'
import * as common from "../../utils/common"
import Language from "../../../../lang"

@connect((store) => {
  return {
    ethereumNode: store.connection.ethereum,
    currentBlock: store.global.currentBlock,
    connected: store.global.connected,
    showBalance: store.global.showBalance,
    utils: store.utils,
    tokens: store.tokens.tokens,
    account: store.account,
    translate: getTranslate(store.locale),
    locale: store.locale,
    exchange: store.exchange,
    haltPayment: store.global.haltPayment,
    analytics: store.global.analytics,
    mode: store.global.params.mode
  }
})

export default class Layout extends React.Component {
  constructor() {
    super();
    this.idleTime = 0;
    this.timeoutEndSession = constant.IDLE_TIME_OUT / 10;    // x10 seconds
    this.intervalIdle = null;
  }

  componentWillMount() {
    document.onload = this.resetTimmer;
    document.onmousemove = this.resetTimmer;
    document.onmousedown = this.resetTimmer; // touchscreen presses
    document.ontouchstart = this.resetTimmer;
    document.onclick = this.resetTimmer;     // touchpad clicks
    document.onscroll = this.resetTimmer;    // scrolling with arrow keys
    document.onkeypress = this.resetTimmer;

    this.intervalIdle = setInterval(this.checkTimmer.bind(this), 10000)
  }

  componentWillUnmount() {
    clearInterval(this.intervalIdle)
  }

  componentDidMount = () => {
    this.props.analytics.callTrack("trackAccessToWidget")
    window.addEventListener("beforeunload", this.handleCloseWeb)
  }

  handleCloseWeb = () => {
    this.props.analytics.callTrack("exitWidget")
  }

  checkTimmer() {
    if (!this.props.account.account) return;
    if (this.props.utils.infoModal && this.props.utils.infoModal.open) return;
    if (this.idleTime >= this.timeoutEndSession) {
      let timeOut = constant.IDLE_TIME_OUT/60
      let titleModal = this.props.translate('error.time_out') || 'Time out'
      let contentModal = this.props.translate('error.clear_data_timeout', {time: timeOut}) || `We've cleared all your data because your session is timed out ${timeOut} minutes`
      this.props.dispatch(openInfoModal(titleModal, contentModal));
      this.endSession();
      this.idleTime = 0
    } else {
      this.idleTime++;
    }
  }

  resetTimmer = _.throttle(this.doResetTimer.bind(this), 5000)

  doResetTimer() {
    this.idleTime = 0;
  }

  endSession() {
    this.props.dispatch(clearSession());
  }

  setActiveLanguage = (language) => {
    this.props.dispatch(changeLanguage(this.props.ethereumNode, language, this.props.locale))
  }

  render() {
    var currentLanguage = common.getActiveLanguage(this.props.locale.languages)
    var paymentHeader =  (
      <PaymentHeader
        translate={this.props.translate}
        step={this.props.exchange.step}
        haltPayment={this.props.haltPayment}
        type = {this.props.exchange.type}
      />
    );

    return (
      <LayoutView
        isGlobalError={this.props.haltPayment}
        history={history}
        Exchange={Exchange}
        supportedLanguages={Language.supportLanguage}
        setActiveLanguage={this.setActiveLanguage}      
        currentLanguage = {currentLanguage}  
        translate={this.props.translate}
        paymentHeader = {paymentHeader}
        theme={this.props.exchange}
        exchange={this.props.exchange}
        mode={this.props.mode}
      />
    )
  }
}
