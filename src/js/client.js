import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { Route } from 'react-router'
import { Link } from 'react-router-dom'
import { Layout } from "./containers/Layout"

import BLOCKCHAIN_INFO from "../../env"

import constanst from "./services/constants"
//import NotSupportPage from "./components/NotSupportPage"
//import platform from 'platform'
//import { blackList } from './blacklist'
import { initSession, initParamsGlobal, haltPayment, initAnalytics } from "./actions/globalActions"
import { initParamsExchange } from "./actions/exchangeActions"

import { PersistGate } from 'redux-persist/lib/integration/react'
import { persistor, store } from "./store"
import Modal from 'react-modal';

import { getTranslate } from 'react-localize-redux'

import * as common from "./utils/common"
import * as validator from "./utils/validators"

import AnalyticFactory from "./services/analytics"
import Web3 from "web3";

//console.log(platform)
//check browser compatible
// var clientPlatform = {
//   name: platform.name,
//   version: platform.version,
//   os: platform.os.family
// }

//  console.log("client: ", clientPlatform)


//var illegal = false
// for (var i = 0; i < blackList.length; i++) {
//   if ((clientPlatform.name === blackList[i].name) && (clientPlatform.os === blackList[i].os)) {
//     illegal = true
//     break
//   }
//   // if (clientPlatform.version.substring(0, blackList[i].version.length) !== blackList[i].version) {
//   //   continue
//   // }
//   // if (clientPlatform.os.indexOf(blackList[i].os) === -1) {
//   //   continue
//   // }
//   // illegal = true
//   // break
// }

function checkInListToken(str, network){
  var listTokens = str.split("_")
  var listPinTokens = []
  //validate tokens
  var symbol
  for (var i = 0; i<listTokens.length; i++){
    symbol = listTokens[i].toUpperCase()
    if (!BLOCKCHAIN_INFO[network].tokens[symbol]){
      return false
    }
    listPinTokens.push(symbol)
  }
  return listPinTokens
}

function initParams(appId) {
  //var translate = getTranslate(store.locale)
  var translate = (...args) => {
    return null
  }

  var widgetParent = document.getElementById(appId)
  var attributeWidget = widgetParent.getAttribute('data-widget-attribute')


  var query = {}
  var receiveAddr
  var receiveToken
  var receiveAmount
  var callback
  var network
  var paramForwarding
  var signer
  var commissionID
  var productName
  var productAvatar
  var type
  var pinTokens
  var paymentData
  var hint
  var defaultPair

  if (attributeWidget === true || attributeWidget === 'true') {
    for (var i = 0, atts = widgetParent.attributes, n = atts.length, arr = []; i < n; i++) {
      var nodeName = atts[i].nodeName
      if (nodeName.includes('data-widget')) {
        var key = nodeName.replace('data-widget-', '');

        key = common.lineToCamel(key)

        query[key] = atts[i].nodeValue
      }
    }

    //this.props.dispatch(initParamsGlobal(query))

    receiveAddr = widgetParent.getAttribute('data-widget-receive-addr')
    receiveToken = widgetParent.getAttribute('data-widget-receive-token')
    receiveAmount = widgetParent.getAttribute('data-widget-receive-amount')
    callback = widgetParent.getAttribute('data-widget-callback')
    network = widgetParent.getAttribute('data-widget-network')
    paramForwarding = widgetParent.getAttribute('data-widget-param-forwarding')
    signer = widgetParent.getAttribute('data-widget-signer')
    commissionID = widgetParent.getAttribute('data-widget-commission-id')
    productName = widgetParent.getAttribute('data-widget-product-name')
    productAvatar = widgetParent.getAttribute('data-widget-product-avatar')
    type = widgetParent.getAttribute('data-widget-type')
    pinTokens = widgetParent.getAttribute('data-widget-pinned-tokens')
    paymentData = widgetParent.getAttribute('data-widget-payment-data') || ""
    hint = widgetParent.getAttribute('data-widget-hint') || ""
    defaultPair = widgetParent.getAttribute('data-widget-default-pair')
  } else {
    query = common.getQueryParams(window.location.search)

    receiveAddr = common.getParameterByName("receiveAddr")
    receiveToken = common.getParameterByName("receiveToken")
    receiveAmount = common.getParameterByName("receiveAmount");
    callback = common.getParameterByName("callback")
    network = common.getParameterByName("network")
    paramForwarding = common.getParameterByName("paramForwarding")
    signer = common.getParameterByName("signer")
    commissionID = common.getParameterByName("commissionId")
    productName = common.getParameterByName("productName")
    productAvatar = common.getParameterByName("productAvatar")
    type = common.getParameterByName("type")
    pinTokens = common.getParameterByName("pinnedTokens")
    paymentData = common.getParameterByName("paymentData") || ""
    hint = common.getParameterByName("hint") || ""
    defaultPair = common.getParameterByName("defaultPair")
  }


  paramForwarding = paramForwarding === "true" || paramForwarding === true ? paramForwarding : "false"
  switch (network) {
    case "production":
    case "mainnet":
      network = "mainnet"
      break
    default:
      network = "ropsten"
      break
  }

  query.appId = appId
  store.dispatch(initParamsGlobal(query))


  var errors = {}
  var defaultPairArr = []

  switch (type) {
    case "swap":
      type = "swap"
      if (receiveAddr) {
        errors["receiveAddr"] = "Swap layout cannot include receiveAddr"
      }
      if (receiveToken) {
        errors["receiveToken"] = "Swap layout cannot include receiveToken"
      }
      if(defaultPair){
        var listDefault = checkInListToken(defaultPair, network)
        if(listDefault === false){
          errors["defaultPair"] = "Default pair includes invalid token"
        }else{
          if(listDefault.length !== 2){
            errors["defaultPair_length"] = "Default pair includes more than 2 tokens"
            break;
          }
          if(listDefault[0] === listDefault[1]){
            errors["defaultPair_pair"] = "2 tokens in default pair must be different"
            break;
          }
          defaultPairArr.push(listDefault[0])
          defaultPairArr.push(listDefault[1])
        }
      }

      break;
    case "buy":
      type = "buy"
      if (receiveAddr) {
        errors["receiveAddr"] = "Buy token layout cannot include receiveAddr"
      }
      if (receiveToken) {
        receiveToken = receiveToken.toUpperCase()
        if (!BLOCKCHAIN_INFO[network].tokens[receiveToken]) {
          errors["receiveToken"] = translate('error.receive_token_is_not_support')
            || "Receive token is not supported by kyber"
        }
      } else {
        errors["receiveToken"] = "Buy token layout must include receiveToken"
      }
      break
    default:
      type = "pay"
      if (receiveAddr) {
        if (validator.verifyAccount(receiveAddr)) {
          errors["receiveAddr"] = translate('error.receive_address_must_be_ethereum_addr')
            || "Receive address must be a valid ethereum address"
        }
      } else {
        errors["receiveAddr"] = "Payment layout must include receiveAddr"
      }

      if (receiveToken) {
        receiveToken = receiveToken.toUpperCase()
        if (!BLOCKCHAIN_INFO[network].tokens[receiveToken]) {
          errors["receiveToken"] = translate('error.receive_token_is_not_support')
            || "Receive token is not supported by kyber"
        }
      }

      break
  }
  


  var isSwap = true
  if (type === "pay"){
    isSwap = false
  }

  // if (isSwap){
  //   if (receiveAddr && receiveAddr !== 'self'){
  //     errors["receiveAddr"] = "Swap layout cannot include receiveAddr"
  //   }
  // }else{
  //   if (!receiveAddr || receiveAddr === 'self' || validator.verifyAccount(receiveAddr)){
  //     errors["receiveAddr"] = translate('error.receive_address_must_be_ethereum_addr') 
  //         || "Receive address must be a valid ethereum address"
  //   }
  // }

  // if (receiveAddr){
  //   if(receiveAddr !== 'self'){
  //     if (validator.verifyAccount(receiveAddr)){
  //       errors["receiveAddr"] = translate('error.receive_address_must_be_ethereum_addr') 
  //         || "Receive address must be a valid ethereum address"
  //     }
  //   }
  // }
  if (!receiveToken) {
    if (receiveAmount && receiveAmount !== "") {
      errors["receiveToken"] = translate('error.receive_token_not_have_amount_have')
        || "Cannot set receive amount of unknown token"
    }
  }

  // if (receiveToken){
  //   receiveToken = receiveToken.toUpperCase()
  //   if (!BLOCKCHAIN_INFO[network].tokens[receiveToken]){
  //     errors["receiveToken"] = translate('error.receive_token_is_not_support') 
  //       || "Receive token is not supported by kyber"
  //   }
  // }else{
  //   if (receiveAmount && receiveAmount !== ""){
  //         errors["receiveToken"] = translate('error.receive_token_not_have_amount_have') 
  //     || "Cannot set receive amount of unknown token"
  //   }
  // }
  // else{
  //   errors["receiveToken"] = translate('error.receive_token_must_be_required') 
  //     || "Receive token must be required"
  // }


  if (receiveAmount && receiveAmount !== "") {
    receiveAmount = receiveAmount.toString();

    if (isNaN(receiveAmount)) {
      errors["receiveAmount"] = translate('error.receive_amount_is_invalid_number')
        || "Receive amount is invalid number"
    }
    if (receiveAmount <= 0) {
      errors["receiveAmount"] = translate('error.receive_amount_must_be_positive')
        || "Receive amount must be positive number"
    }
  } else {
    receiveAmount = null
  }


  if (commissionID) {
    if (validator.verifyAccount(commissionID)) {
      errors["commissionID"] = translate('error.commission_address_must_be_valid')
        || "Commission address must be a valid ethereum address"
    }
  }

  if (callback) {
    if (!callback.startsWith("https://")) {
      errors["callback"] = translate('error.callback_https')
        || "Callback must be a https location"
    }
  }

  if (signer) {
    var invalidAddresses = []
    var addressArr = signer.split("_")

    addressArr.map(address => {
      if (validator.verifyAccount(address)) {
        invalidAddresses.push(address)
      }
    })
    if (invalidAddresses.length > 0) {
      errors["signer"] = translate('error.signer_include_invalid_address') || "Signer include invalid addresses"
    }
  }

  if (!validator.verifyNetwork(network)) {
    errors["network"] = translate('error.invalid_network') || "Current network is not supported"
  }

  if (pinTokens){
    var listPinTokens = checkInListToken(pinTokens, network)
    if (listPinTokens === false){
      errors["pinTokens"] = translate('error.invalid_pinTokens') || "Pinned tokens include invalid tokens"
    }
  }

  paymentData = Web3.utils.utf8ToHex(paymentData);
  hint = Web3.utils.utf8ToHex(hint);

  if (validator.anyErrors(errors)) {
    store.dispatch(haltPayment(errors))
  } else {
    receiveToken = receiveToken ? receiveToken : "KNC"
    if (type==="swap" && defaultPairArr.length === 2){
      receiveToken = defaultPairArr[1]
    }
    var tokenAddr = BLOCKCHAIN_INFO[network].tokens[receiveToken].address
    store.dispatch(initParamsExchange(receiveAddr, receiveToken, tokenAddr, receiveAmount, productName, productAvatar,
      callback, network, paramForwarding, signer, commissionID, isSwap, type, listPinTokens, defaultPairArr, paymentData, hint));

    //init analytic
    var analytic = new AnalyticFactory({ listWorker: ['mix'], network })
    store.dispatch(initAnalytics(analytic))
  }
}

Modal.setAppElement('body');

window.kyberWidgetInstance = {}

//console.log(document.getElementById(constanst.APP_NAME))
window.kyberWidgetInstance.render = (widgetId) => {
  var appId = widgetId ? widgetId : constanst.APP_NAME

  if (!document.getElementById(appId)) {
    return
  }
  // if (illegal) {
  //   ReactDOM.render(
  //     <NotSupportPage client={clientPlatform} />
  //     , document.getElementById(constanst.APP_NAME));
  // } else {
  //   ReactDOM.render(
  //     <PersistGate persistor={persistor}>
  //       <Provider store={store}>
  //         <Layout />
  //       </Provider>
  //     </PersistGate>, document.getElementById(constanst.APP_NAME));
  // }
  store.dispatch(initSession())
  initParams(appId)

  ReactDOM.render(
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <Layout />
      </Provider>
    </PersistGate>, document.getElementById(appId));
}



window.kyberWidgetInstance.render()



