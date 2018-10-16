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
import { initListTokens } from "./actions/tokenActions"

import { PersistGate } from 'redux-persist/lib/integration/react'
import { persistor, store } from "./store"
import Modal from 'react-modal';

import { getTranslate } from 'react-localize-redux'

import * as common from "./utils/common"
import * as validator from "./utils/validators"

import AnalyticFactory from "./services/analytics"
import Web3 from "web3";

function getListTokens(network) {

  //in ropsten
  return new Promise((resolve, reject) => {
    //return list of object tokens
    fetch(BLOCKCHAIN_INFO[network].api_tokens, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
    }).then((response) => {
      return response.json()
    })
      .then((result) => {
        if (result.success) {
          //check listing time
          var now = Math.round(new Date().getTime() / 1000)
          var tokens = {}
          result.data.map(val => {
            if (val.listing_time > now) return
            tokens[val.symbol] = val
          })
          resolve(tokens)

          //resolve(result.data)
        } else {
          //rejected(new Error("Cannot get data"))
          //get from snapshot
          var tokens = BLOCKCHAIN_INFO[network].tokens
          resolve(tokens)
        }
      })
      .catch((err) => {
        console.log(err)
        var tokens = BLOCKCHAIN_INFO[network].tokens
        resolve(tokens)
      })
  })
}

function checkInListToken(str, tokens) {

  var listTokens = str.split("_")
  var listPinTokens = []
  //validate tokens
  var symbol
  for (var i = 0; i < listTokens.length; i++) {
    symbol = listTokens[i].toUpperCase()
    if (!tokens[symbol]) {
      return false
    }
    listPinTokens.push(symbol)
  }
  return listPinTokens
}

function initParams(appId, wrapper, getPrice, getTxData) {
  //var translate = getTranslate(store.locale)
  var translate = (...args) => {
    return null
  }

  var widgetParent = document.getElementById(appId)
  var attributeWidget = widgetParent.getAttribute('data-widget-attribute')


  var query = {}

  //var etheremonAddr
  var productId
  var productName
  var productAvatar
  //var payPrice

  var callback
  var network
  var paramForwarding
  var signer
  var commissionID
  var pinTokens

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

    //etheremonAddr = widgetParent.getAttribute('data-widget-etheremon-addr')
    productId = widgetParent.getAttribute('data-widget-product-id')
    productName = widgetParent.getAttribute('data-widget-product-name')
    productAvatar = widgetParent.getAttribute('data-widget-product-avatar')

    callback = widgetParent.getAttribute('data-widget-callback')
    network = widgetParent.getAttribute('data-widget-network')
    paramForwarding = widgetParent.getAttribute('data-widget-param-forwarding')
    signer = widgetParent.getAttribute('data-widget-signer')
    commissionID = widgetParent.getAttribute('data-widget-commission-id')
    // payPrice = widgetParent.getAttribute('data-widget-pay-price')   
    pinTokens = widgetParent.getAttribute("data-widget-pinned-tokens")
  } else {
    query = common.getQueryParams(window.location.search)

    // etheremonAddr = common.getParameterByName("etheremonAddr")
    productId = common.getParameterByName("productId")
    productName = common.getParameterByName("productName")
    productAvatar = common.getParameterByName("productAvatar")

    callback = common.getParameterByName("callback")
    network = common.getParameterByName("network")
    paramForwarding = common.getParameterByName("paramForwarding")
    signer = common.getParameterByName("signer")
    commissionID = common.getParameterByName("commissionId")
    // payPrice = common.getParameterByName("payPrice")      
    pinTokens = common.getParameterByName("pinnedTokens")
  }

  //this.props.dispatch(initParamsGlobal(query))


  paramForwarding = paramForwarding === "true" || paramForwarding === true ? paramForwarding : "false"
  switch (network) {
    case "production":
    case "mainnet":
      network = "mainnet"
      break
    case "rinkeby":
      network = "rinkeby"
      break
    default:
      network = "ropsten"
      break
  }
  //init tokens
  //store.dispatch(initListTokens(network))

  getListTokens(network).then(tokens => {

    query.appId = appId
    query.network = network
    store.dispatch(initParamsGlobal(query))


    var errors = {}
    // if (validator.verifyAccount(etheremonAddr)){
    //   errors["etheremonAddr"] = translate('error.etheremon_address_must_be_ethereum_addr') 
    //     || "etheremonAddr must be a valid ethereum address"
    // }
    // if (monsterId){
    //   monsterId = parseInt(monsterId, 10)
    //   if (monsterId === 0){
    //     errors["monsterId"] = translate('error.monster_id_is_not_int') 
    //     || "monsterId must be interger"
    //   }      
    // }else{
    //   errors["monsterId"] = translate('error.monster_id_must_be_require') 
    //     || "monsterId must be required"
    // }

    // if (payPrice){
    //   payPrice = parseFloat(payPrice);
    //   if(isNaN(payPrice)){
    //     errors["payPrice"] = translate('error.pay_price_must_be_a_number') 
    //     || "payPrice must be number"
    //   }
    // }else{
    //   payPrice = 0
    // }




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

    if (pinTokens) {
      var listTokens = pinTokens.split("_")
      var listPinTokens = []
      //validate tokens
      var symbol
      for (var i = 0; i < listTokens.length; i++) {
        symbol = listTokens[i].toUpperCase()
        if (!BLOCKCHAIN_INFO[network].tokens[symbol]) {
          errors["pinTokens"] = translate('error.invalid_pinTokens') || "Pinned tokens include invalid tokens"
        }
      }
    }

    if (validator.anyErrors(errors)) {
      store.dispatch(haltPayment(errors))
    } else {
      //var tokenAddr =  BLOCKCHAIN_INFO[network].tokens[receiveToken].address
      store.dispatch(initParamsExchange(productId, productName, productAvatar, callback, network, paramForwarding, signer, commissionID, listPinTokens, getPrice, getTxData, wrapper, tokens));

      //init analytic
      var analytic = new AnalyticFactory({ listWorker: ['mix'], network })
      store.dispatch(initAnalytics(analytic))
    }
  }).catch(err => {
    console.log(err)
    var errors = { tokens: "Cannot get list tokens" }
    store.dispatch(haltPayment(errors))
  })
}

Modal.setAppElement('body');

window.kyberWidgetInstance = {}

//console.log(document.getElementById(constanst.APP_NAME))
window.kyberWidgetInstance.render = (obj) => {
  const { widgetId, getPrice, getTxData, wrapper } = obj
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
  initParams(appId, wrapper, getPrice, getTxData)

  ReactDOM.render(
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <Layout />
      </Provider>
    </PersistGate>, document.getElementById(appId));
}






