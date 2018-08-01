import React from "react"
import { connect } from "react-redux"
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
import InfoKyber from "../../components/InfoKyber"
import { Exchange } from "../../containers/Exchange"
import { Header } from "../../containers/Header"
import { ImportAccount } from "../ImportAccount"

//import { Footer } from "../Layout"

import { Processing, ExchangeHistory } from "../../containers/CommonElements/"

import constanst from "../../services/constants"
// import { createNewConnection } from "../../services/ethereum/connection"

import history from "../../history"

import { clearSession, changeLanguage, initParamsGlobal, haltPayment } from "../../actions/globalActions"
import {initParamsExchange} from "../../actions/exchangeActions"

import { openInfoModal } from "../../actions/utilActions"
import { setConnection, createNewConnectionInstance } from "../../actions/connectionActions"



import { default as _ } from 'underscore';
import { LayoutView } from "../../components/Layout"
import { getTranslate } from 'react-localize-redux'
import * as common from "../../utils/common"
import * as validator from "../../utils/validators"

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
    exchange: store.exchange
    // currentLanguage: getActiveLanguage(store.locale).code
  }
})

export default class Layout extends React.Component {
  constructor() {
    super();
    this.idleTime = 0;
    this.timeoutEndSession = constanst.IDLE_TIME_OUT / 10;    // x10 seconds
    this.idleMode = false;
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

    this.props.dispatch(createNewConnectionInstance())
    // createNewConnection()
  }


  componentDidMount(){
    var query  = common.getQueryParams(window.location.search)
    this.props.dispatch(initParamsGlobal(query))

    var receiveAddr = common.getParameterByName("receiveAddr")
    var receiveToken = common.getParameterByName("receiveToken")
    var receiveAmount = common.getParameterByName("receiveAmount").toString();
    // console.log("receiveAmount")
    // console.log(receiveAmount)
    var callback = common.getParameterByName("callback")
    var network = common.getParameterByName("network")
    var paramForwarding = common.getParameterByName("paramForwarding")
    var signer = common.getParameterByName("signer")
    var commissionID = common.getParameterByName("commissionID")

    

    var errors = {}
    if (validator.verifyAccount(receiveAddr)){
      errors["receiveAddr"] = this.props.translate('error.receive_address_must_be_ethereum_addr') 
        || "Receive address must be a valid ethereum address"
    }
    if (receiveToken){
      receiveToken = receiveToken.toUpperCase()
      if (!this.props.tokens[receiveToken]){
        errors["receiveToken"] = this.props.translate('error.receive_token_is_not_support') 
          || "Receive token is not supported by kyber"
      }
    }else{
      errors["receiveToken"] = this.props.translate('error.receive_token_must_be_required') 
        || "Receive token must be required"
    }
    

    if (receiveAmount && receiveAmount !== ""){
      if (isNaN(receiveAmount)) {
        errors["receiveAmount"] = this.props.translate('error.receive_amount_is_invalid_number') 
          || "Receive amount is invalid number"
      }
      if (receiveAmount <= 0){
        errors["receiveAmount"] = this.props.translate('error.receive_amount_must_be_positive') 
          || "Receive amount must be positive number"
      }
    }else{
      receiveAmount = null
    }

    
    if (commissionID){
      if (validator.verifyAccount(commissionID)){
        errors["commissionID"] = this.props.translate('error.commission_address_must_be_valid') 
          || "Commission address must be a valid ethereum address"
      }
    }

    if (callback){
      if (!callback.startsWith("https://")){
        errors["callback"] = this.props.translate('error.callback_https') 
        || "Callback must be a https location"        
      }
    }

    if (signer){
      var invalidAddresses = []
      var addressArr = signer.split("_")
      
      addressArr.map(address => {
        if (validator.verifyAccount(address)){
          invalidAddresses.push(address)
        }
      })      
      if (invalidAddresses.length > 0){
        errors["signer"] = this.props.translate('error.signer_include_invalid_address') || "Signer include invalid addresses"
      }      
    }
    
    if (validator.anyErrors(errors)){
      this.props.dispatch(haltPayment(errors))
    }else{
      var tokenAddr = this.props.tokens[receiveToken].address
      this.props.dispatch(initParamsExchange(receiveAddr, receiveToken, tokenAddr, receiveAmount, callback, network, paramForwarding, signer, commissionID));
    }
  }

  checkTimmer() {
    if (!this.props.account.account) return;
    if (this.props.utils.infoModal && this.props.utils.infoModal.open) return;
    if (this.idleTime >= this.timeoutEndSession && this.props.exchange.step > 2) {
      let timeOut = constanst.IDLE_TIME_OUT/60
      let titleModal = this.props.translate('error.time_out') || 'Time out'
      let contentModal = this.props.translate('error.clear_data_timeout', {time: timeOut}) || `We've cleared all your data because your session is timed out ${timeOut} minutes`
      this.props.dispatch(openInfoModal(titleModal, contentModal));
      this.endSession();
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
   // var exchangeHistory = <TransactionList />
    //var market = <Market />
    //var footer = <Footer />
   // var rate = <Rate />
    return (
      <LayoutView
        history={history}
        Header={Header}
        Exchange={Exchange}
        supportedLanguages={Language.supportLanguage}
        setActiveLanguage={this.setActiveLanguage}      
        currentLanguage = {currentLanguage}  
        translate={this.props.translate}
      />
    )
  }
}
