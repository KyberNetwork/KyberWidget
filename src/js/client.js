import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { Layout } from "./containers/Layout"
import BLOCKCHAIN_INFO from "../../env"
import constants from "./services/constants"
import { initSession, initParamsGlobal, haltPayment, initAnalytics } from "./actions/globalActions"
import { initParamsExchange } from "./actions/exchangeActions"
import { PersistGate } from 'redux-persist/lib/integration/react'
import { persistor, store } from "./store"
import Modal from 'react-modal';
import * as common from "./utils/common"
import * as validator from "./utils/validators"
import AnalyticFactory from "./services/analytics"
import Web3 from "web3";
import { initLanguage } from "./services/language";

function getListTokens(network) {
  return new Promise((resolve, reject) => {
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
          var now = Math.round(new Date().getTime() / 1000)
          var tokens = {}
          result.data.map(val => {
            if (val.listing_time > now) return
            tokens[val.symbol] = val
          })
          resolve(tokens)
        } else {
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

function initParams(appId) {
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
  var commissionFee
  var products
  var productNames
  var productQtys
  var productImages
  var type
  var pinnedTokens
  var paymentData
  var hint
  var defaultPair
  var theme
  var mode
  var language
  var title

  if (attributeWidget === true || attributeWidget === 'true') {
    for (var i = 0, atts = widgetParent.attributes, n = atts.length, arr = []; i < n; i++) {
      var nodeName = atts[i].nodeName
      if (nodeName.includes('data-widget')) {
        var key = nodeName.replace('data-widget-', '');

        key = common.lineToCamel(key)

        query[key] = atts[i].nodeValue
      }
    }

    receiveAddr = widgetParent.getAttribute('data-widget-receive-addr')
    receiveToken = widgetParent.getAttribute('data-widget-receive-token')
    receiveAmount = widgetParent.getAttribute('data-widget-receive-amount')
    callback = widgetParent.getAttribute('data-widget-callback')
    network = widgetParent.getAttribute('data-widget-network')
    paramForwarding = widgetParent.getAttribute('data-widget-param-forwarding')
    signer = widgetParent.getAttribute('data-widget-signer')
    commissionID = widgetParent.getAttribute('data-widget-commission-id')
    commissionFee = widgetParent.getAttribute('data-widget-commission-fee')
    type = widgetParent.getAttribute('data-widget-type')
    pinnedTokens = widgetParent.getAttribute('data-widget-pinned-tokens') || []
    paymentData = widgetParent.getAttribute('data-widget-payment-data') || ""
    hint = widgetParent.getAttribute('data-widget-hint') || ""
    defaultPair = widgetParent.getAttribute('data-widget-default-pair')
    theme = widgetParent.getAttribute('data-widget-theme') || "theme-emerald"
    mode = widgetParent.getAttribute('data-widget-mode')
    products = widgetParent.getAttribute('data-widget-products')
    products = products ? JSON.parse(products) : [];
    language = widgetParent.getAttribute('data-widget-lang') || "en"
    title = widgetParent.getAttribute('data-widget-title')
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
    commissionFee = common.getParameterByName('commissionFee')
    productNames = common.getMultipleValuesByName("productName")
    productQtys = common.getMultipleValuesByName("productQty")
    productImages = common.getMultipleValuesByName("productImage")
    type = common.getParameterByName("type")
    pinnedTokens = common.getParameterByName("pinnedTokens") || []
    paymentData = common.getParameterByName("paymentData") || ""
    hint = common.getParameterByName("hint") || ""
    defaultPair = common.getParameterByName("defaultPair")
    theme = common.getParameterByName("theme") || "theme-emerald"
    mode = common.getParameterByName("mode")
    products = productNames ? common.getProductsFromParam(productNames, productQtys, productImages) : [];
    language = common.getParameterByName("lang") || 'en'
    title = common.getParameterByName("title")
  }

  initLanguage(language, store);

  paramForwarding = paramForwarding === "true" || paramForwarding === true ? paramForwarding : "false"
  switch (network) {
    case "production":
    case "mainnet":
      network = "production"
      break
    case "staging":
      network = "staging"
      break
    default:
      network = "ropsten"
      break
  }

  getListTokens(network).then(tokens => {
    query.appId = appId
    query.mode = mode;
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
        if (defaultPair) {
          var listDefault = checkInListToken(defaultPair, tokens)
          if (listDefault === false) {
            errors["defaultPair"] = "Default pair includes invalid token"
          } else {
            if (listDefault.length !== 2) {
              errors["defaultPair_length"] = "Default pair includes more than 2 tokens"
              break;
            }
            if (listDefault[0] === listDefault[1]) {
              errors["defaultPair_pair"] = "2 tokens in default pair must be different"
              break;
            }
            defaultPairArr.push(listDefault[0])
            defaultPairArr.push(listDefault[1])
          }
        }
        break;
      case "buy":
        commissionFee = 0
        type = "buy"
        if (receiveAddr) {
          errors["receiveAddr"] = "Buy token layout cannot include receiveAddr"
        }
        if (receiveToken) {
          receiveToken = receiveToken.toUpperCase()
          if (!tokens[receiveToken]) {
            errors["receiveToken"] = translate('error.receive_token_is_not_support')
              || "Receive token is not supported by kyber"
          }
        } else {
          errors["receiveToken"] = "Buy token layout must include receiveToken"
        }
        break
      default:
        type = "pay"
        commissionFee = 0
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
          if (!tokens[receiveToken]) {
            errors["receiveToken"] = translate('error.receive_token_is_not_support')
              || "Receive token is not supported by kyber"
          }
        }

        break
    }

    var isSwap = true
    if (type === "pay") {
      isSwap = false
    }

    if (!receiveToken) {
      if (receiveAmount && receiveAmount !== "") {
        errors["receiveToken"] = translate('error.receive_token_not_have_amount_have')
          || "Cannot set receive amount of unknown token"
      }
    }

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
      if (commissionFee == "") {
        commissionFee = 0
      } else if (isNaN(commissionFee)) {
        errors["commissionFee"] = translate('error.commission_fee_must_be_valid')
          || "Commission fee must be an integer number"
      } else {
        commissionFee = parseInt(commissionFee)
        if (commissionFee > 2000) {
          errors["commissionFee"] = translate('error.commission_fee_too_large')
          || "Commission fee must be smaller than 20bps"
        }
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

    paymentData = Web3.utils.utf8ToHex(paymentData);
    hint = Web3.utils.utf8ToHex(hint);

    if (validator.anyErrors(errors)) {
      store.dispatch(haltPayment(errors))
    } else {
      receiveToken = receiveToken ? receiveToken : "KNC"
      if (type === "swap" && defaultPairArr.length === 2) {
        receiveToken = defaultPairArr[1]
      }
      var tokenAddr = tokens[receiveToken].address

      store.dispatch(initParamsExchange(
        receiveAddr, receiveToken, tokenAddr, receiveAmount, products, callback, network, paramForwarding,
        signer, commissionID, commissionFee, isSwap, type, pinnedTokens, defaultPairArr, paymentData, hint, tokens, theme, title
      ));

      //init analytic
      var analytic = new AnalyticFactory({ listWorker: ['mix'], network })
      store.dispatch(initAnalytics(analytic))
    }
  }).catch(err => {
    var errors = {
      tokens: "Cannot get list tokens"
    }
    store.dispatch(haltPayment(errors))
  })
}

Modal.setAppElement('body');

window.kyberWidgetInstance = {};
window.kyberWidgetInstance.render = (widgetId) => {
  var appId = widgetId ? widgetId : constants.APP_NAME;
  const appContainer = document.getElementById(appId);

  if (!document.getElementById(appId)) {
    return
  }
  store.dispatch(initSession())
  initParams(appId)

  ReactDOM.render(
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <Layout />
      </Provider>
    </PersistGate>, appContainer
  );
};
window.kyberWidgetInstance.destroy = (widgetId) => {
  const appId = widgetId ? widgetId : constants.APP_NAME;
  const appContainer = document.getElementById(appId);
  ReactDOM.unmountComponentAtNode(appContainer);
};

window.kyberWidgetInstance.render()
