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
import * as validator from "./utils/validators"
import AnalyticFactory from "./services/analytics"
import Web3 from "web3";

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
          //check listing time
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

function initParams(appId, wrapper, getPrice, getTxData, params, errors) {
  const query = {...params};
  query.appId = appId;
  query.network = params.network;

  getListTokens(params.network).then(tokens => {
    store.dispatch(initParamsGlobal(query))

    if (validator.anyErrors(errors)) {
      store.dispatch(haltPayment(errors))
    } else {
      const tokenAddr = tokens[params.receiveToken].address;
      const paymentData = Web3.utils.utf8ToHex(params.paymentData);

      store.dispatch(initParamsExchange(
        params.saleAddr, params.receiveToken, tokenAddr, params.receiveAmount, params.products, params.callback, params.network, params.paramForwarding,
        params.signer, params.commissionId, false, 'pay', params.pinnedTokens, null, paymentData, params.hint, tokens, params.theme,
        getPrice, getTxData, wrapper
      ));

      var analytic = new AnalyticFactory({ listWorker: ["mix"], network: params.network })
      store.dispatch(initAnalytics(analytic))
    }
  }).catch((e) => {
    store.dispatch(haltPayment({ tokens: "Cannot get list tokens" }))
  })
}

Modal.setAppElement('body');

window.kyberWidgetInstance = {}

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
