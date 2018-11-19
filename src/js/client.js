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
        if (result.error === false) {
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

function initParams(appId, wrapper, getPrice, getTxData, params, errors) {
  var widgetParent = document.getElementById(appId)
  //var attributeWidget = widgetParent.getAttribute('data-widget-attribute')
  var query = {...params}

  // if (attributeWidget === true || attributeWidget === 'true') {
  //   for (var i = 0, atts = widgetParent.attributes, n = atts.length, arr = []; i < n; i++) {
  //     var nodeName = atts[i].nodeName
  //     if (nodeName.includes('data-widget')) {
  //       var key = nodeName.replace('data-widget-', '');

  //       key = common.lineToCamel(key)

  //       query[key] = atts[i].nodeValue
  //     }
  //   }
  // } else {
  //   query = common.getQueryParams(window.location.search)
  // }

  getListTokens(params.network).then(tokens => {
    query.appId = appId
    query.network = params.network
    store.dispatch(initParamsGlobal(query))

    if (validator.anyErrors(errors)) {
      store.dispatch(haltPayment(errors))
    } else {
      store.dispatch(initParamsExchange(
        params.productId, params.productName, params.productAvatar, params.callback, params.network, params.paramForwarding,
        params.signer, params.commissionID, params.pinnedTokens, params.disabledTokens, getPrice, getTxData, wrapper, tokens
      ));

      //init analytic
      var analytic = new AnalyticFactory({ listWorker: ["mix"], network: params.network })
      store.dispatch(initAnalytics(analytic))
    }
  }).catch(() => {
    store.dispatch(haltPayment({ tokens: "Cannot get list tokens" }))
  })
}

Modal.setAppElement('body');

window.kyberWidgetInstance = {}

//console.log(document.getElementById(constants.APP_NAME))
window.kyberWidgetInstance.render = (obj) => {
  const { appId, getPrice, getTxData, wrapper, params, errors } = obj;
  var widgetId = appId ? appId : constants.APP_NAME

  if (!document.getElementById(widgetId)) {
    return
  }

  store.dispatch(initSession())
  initParams(widgetId, wrapper, getPrice, getTxData, params, errors);

  ReactDOM.render(
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <Layout />
      </Provider>
    </PersistGate>, document.getElementById(appId));
}
