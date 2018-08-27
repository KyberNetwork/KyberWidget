import React from "react"
import { connect } from "react-redux"
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
//import InfoKyber from "../../components/InfoKyber"
import { Exchange } from "../../containers/Exchange"
import { Header } from "../../containers/Header"
import { ImportAccount } from "../ImportAccount"

//import { Footer } from "../Layout"

import { Processing, ExchangeHistory } from "../../containers/CommonElements/"
import {PaymentHeader} from "../../components/Header";

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
    exchange: store.exchange,
    // currentLanguage: getActiveLanguage(store.locale).code
    haltPayment: store.global.haltPayment
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

    //this.props.dispatch(createNewConnectionInstance())
    // createNewConnection()
  }


  // componentDidMount1(){
  //   var widgetParent = document.getElementById(constanst.APP_NAME)
  //   var attributeWidget = widgetParent.getAttribute('data-widget-attribute')

    
  //   var query = {}
  //   var receiveAddr
  //   var receiveToken
  //   var receiveAmount
  //   var callback
  //   var network
  //   var paramForwarding
  //   var signer
  //   var commissionID

  //   if (attributeWidget === true || attributeWidget === 'true'){
  //     for (var i = 0, atts = widgetParent.attributes, n = atts.length, arr = []; i < n; i++){
  //         var nodeName = atts[i].nodeName
  //         if(nodeName.includes('data-widget')){
  //           var key = nodeName.replace('data-widget-','');
            
  //           key = common.lineToCamel(key)

  //           query[key] = atts[i].nodeValue
  //         }
  //     }

  //     //this.props.dispatch(initParamsGlobal(query))

  //     receiveAddr = widgetParent.getAttribute('data-widget-receive-addr')
  //     receiveToken = widgetParent.getAttribute('data-widget-receive-token')
  //     receiveAmount = widgetParent.getAttribute('data-widget-receive-amount')
  //     callback = widgetParent.getAttribute('data-widget-callback')
  //     network = widgetParent.getAttribute('data-widget-network')
  //     paramForwarding = widgetParent.getAttribute('data-widget-param-forwarding')
  //     signer = widgetParent.getAttribute('data-widget-signer')
  //     commissionID = widgetParent.getAttribute('data-widget-commission-id')

  //   }else{
  //     query  = common.getQueryParams(window.location.search)

  //     receiveAddr = common.getParameterByName("receiveAddr")
  //     receiveToken = common.getParameterByName("receiveToken")
  //     receiveAmount = common.getParameterByName("receiveAmount");
  //     callback = common.getParameterByName("callback")
  //     network = common.getParameterByName("network")
  //     paramForwarding = common.getParameterByName("paramForwarding")
  //     signer = common.getParameterByName("signer")
  //     commissionID = common.getParameterByName("commissionId")
  //   }


  //   paramForwarding = paramForwarding === "true" ||  paramForwarding === true? paramForwarding : "false"
    
  //   this.props.dispatch(initParamsGlobal(query))
    

  //   var errors = {}
  //   if(receiveAddr !== 'self'){
  //     if (validator.verifyAccount(receiveAddr)){
  //       errors["receiveAddr"] = this.props.translate('error.receive_address_must_be_ethereum_addr') 
  //         || "Receive address must be a valid ethereum address"
  //     }
  //   }
    
  //   if (receiveToken){
  //     receiveToken = receiveToken.toUpperCase()
  //     if (!this.props.tokens[receiveToken]){
  //       errors["receiveToken"] = this.props.translate('error.receive_token_is_not_support') 
  //         || "Receive token is not supported by kyber"
  //     }
  //   }else{
  //     errors["receiveToken"] = this.props.translate('error.receive_token_must_be_required') 
  //       || "Receive token must be required"
  //   }
    

  //   if (receiveAmount && receiveAmount !== ""){
  //     receiveAmount = receiveAmount.toString();

  //     if (isNaN(receiveAmount)) {
  //       errors["receiveAmount"] = this.props.translate('error.receive_amount_is_invalid_number') 
  //         || "Receive amount is invalid number"
  //     }
  //     if (receiveAmount <= 0){
  //       errors["receiveAmount"] = this.props.translate('error.receive_amount_must_be_positive') 
  //         || "Receive amount must be positive number"
  //     }
  //   }else{
  //     receiveAmount = null
  //   }

    
  //   if (commissionID){
  //     if (validator.verifyAccount(commissionID)){
  //       errors["commissionID"] = this.props.translate('error.commission_address_must_be_valid') 
  //         || "Commission address must be a valid ethereum address"
  //     }
  //   }

  //   if (callback){
  //     if (!callback.startsWith("https://")){
  //       errors["callback"] = this.props.translate('error.callback_https') 
  //       || "Callback must be a https location"        
  //     }
  //   }

  //   if (signer){
  //     var invalidAddresses = []
  //     var addressArr = signer.split("_")
      
  //     addressArr.map(address => {
  //       if (validator.verifyAccount(address)){
  //         invalidAddresses.push(address)
  //       }
  //     })      
  //     if (invalidAddresses.length > 0){
  //       errors["signer"] = this.props.translate('error.signer_include_invalid_address') || "Signer include invalid addresses"
  //     }      
  //   }

  //   if (!validator.verifyNetwork(network)) {
  //     errors["network"] = this.props.translate('error.invalid_network') || "Current network is not supported"
  //   }
    
  //   if (validator.anyErrors(errors)){
  //     this.props.dispatch(haltPayment(errors))
  //   }else{
  //     var tokenAddr = this.props.tokens[receiveToken].address
  //     this.props.dispatch(initParamsExchange(receiveAddr, receiveToken, tokenAddr, receiveAmount, callback, network, paramForwarding, signer, commissionID));
  //   }
  // }

  checkTimmer() {
    if (!this.props.account.account) return;
    if (this.props.utils.infoModal && this.props.utils.infoModal.open) return;
    if (this.idleTime >= this.timeoutEndSession) {
      let timeOut = constanst.IDLE_TIME_OUT/60
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
   // var exchangeHistory = <TransactionList />
    //var market = <Market />
    //var footer = <Footer />
   // var rate = <Rate />

    var paymentHeader =  <PaymentHeader 
    translate={this.props.translate}
    step={this.props.exchange.step}
    haltPayment={this.props.haltPayment}
    isSwap = {this.props.exchange.isSwap}
  />
    return (
      <LayoutView
        history={history}
        Header={Header}
        Exchange={Exchange}
        supportedLanguages={Language.supportLanguage}
        setActiveLanguage={this.setActiveLanguage}      
        currentLanguage = {currentLanguage}  
        translate={this.props.translate}
                
        paymentHeader = {paymentHeader}
      />
    )
  }
}
