import React from 'react';
import constants from "../constants"
import {
  updateBlock, updateAllRate, updateAllRateUSD,
  checkConnection, setGasPrice, setMaxGasPrice
} from "../../actions/globalActions"
import { updateAccount, updateTokenBalance } from "../../actions/accountActions"
import { updateRateExchange, estimateGas, checkKyberEnable, verifyExchange } from "../../actions/exchangeActions"
import { estimateGasTransfer, verifyTransfer } from "../../actions/transferActions"
import * as marketActions from "../../actions/marketActions"
import BLOCKCHAIN_INFO from "../../../../env"
import { store } from "../../store"
import * as providers from "./nodeProviders"
import * as common from "../../utils/common"

export default class EthereumService extends React.Component {
  constructor(props) {
    super(props)
    
    this.network = props.network

    this.listProviders = []
    for (var node of BLOCKCHAIN_INFO[this.network].connections.http) {
      switch (node.type) {
        case "cached":
          var provider = new providers.CachedServerProvider({ url: node.endPoint, network: this.network })
          this.listProviders.push(provider)
          break
        case "prune":
          var provider = new providers.PruneProvider({ url: node.endPoint, network: this.network })
          this.listProviders.push(provider)
          break
        case "none_prune":
          var provider = new providers.NonePruneProvider({ url: node.endPoint, network: this.network })
          this.listProviders.push(provider)
          break
      }
    }
  }

  subcribe() {
    var callBackAsync = this.fetchData.bind(this)
    callBackAsync()
    this.intervalAsyncID = setInterval(callBackAsync, 10000)
  }

  fetchData() {
    var state = store.getState()
    if (!common.checkComponentExist(state.global.params.appId)){
      clearInterval(this.intervalAsyncID)
      return
    }

    this.checkKyberEnable()
    this.fetchRateData()
    this.fetchRateUSD()
    this.fetchAccountData()
    this.fetchRateExchange()
    this.checkConnection()
    this.fetchMaxGasPrice()
    this.fetchGasprice()
  }


  fetchData5Min(){
    this.fetchVolumn()
  }

  fetchDataSync() {
    var state = store.getState()
    this.verifyExchange()    
  }

  testAnalize() {
    var state = store.getState()
    var ethereum = state.connection.ethereum
  }
  
  fetchVolumn () {
    store.dispatch(marketActions.getVolumn())
  }
  
  fetchRateData() {
    var state = store.getState()
    var tokens = state.tokens.tokens
    var ethereum = state.connection.ethereum  
    store.dispatch(updateAllRate(ethereum, tokens))
  }

  fetchTokenBalance() {
    var state = store.getState()
    var ethereum = state.connection.ethereum
    var tokens = state.tokens.tokens
    var account = state.account.account
    if (account.address) {
      store.dispatch(updateTokenBalance(ethereum, account.address, tokens))
    }
  }

  fetchRateUSD() {
    var state = store.getState()
    var ethereum = state.connection.ethereum
    var tokens = state.tokens.tokens
    
    store.dispatch(updateAllRateUSD(ethereum, tokens))
  }

  fetchAccountData = () => {
    var state = store.getState()
    var ethereum = state.connection.ethereum
    var account = state.account.account
    if (account.address) {
      store.dispatch(updateAccount(ethereum, account))
    }
  }

  fetchCurrentBlock = () => {
    var state = store.getState()
    var ethereum = state.connection.ethereum
    store.dispatch(updateBlock(ethereum))
  }

  fetchRateExchange = (isManual = false) => {
    const state = store.getState()
    const exchange = state.exchange
    const source = exchange.sourceToken
    const dest = exchange.destToken
    const sourceTokenSymbol = exchange.sourceTokenSymbol
    let sourceAmount;

    if (exchange.sourceTokenSymbol === exchange.destTokenSymbol){
      return
    }

    if (exchange.isHaveDestAmount || exchange.inputFocus === 'dest') {
      sourceAmount = false;
    } else {
      sourceAmount = exchange.sourceAmount;
    }

    store.dispatch(updateRateExchange(source, dest, sourceAmount, sourceTokenSymbol, isManual))
  }

  fetchGasprice = () => {
    var state = store.getState()
    var ethereum = state.connection.ethereum
    store.dispatch(setGasPrice(ethereum))
  }

  fetchMaxGasPrice = () => {
    var state = store.getState()
    store.dispatch(setMaxGasPrice())
  }

  fetchGasExchange = () => {
    var state = store.getState()
    var account = state.account.account
    if (!account.address) {
      return
    }
    var pathname = state.router.location.pathname
    console.log(pathname)
    if (!pathname.includes(constants.BASE_HOST + "/swap")) {
      return
    }
    store.dispatch(estimateGas())
  }

  fetchGasTransfer = () => {
    var state = store.getState()
    var account = state.account.account
    if (!account.address) {
      return
    }

    var pathname = state.router.location.pathname
    if (!pathname.includes(constants.BASE_HOST + "/transfer")) {
      return
    }
    store.dispatch(estimateGasTransfer())
  }

  fetMarketData = () => {
    store.dispatch(marketActions.getMarketData())
  }

  fetGeneralInfoTokens() {
    store.dispatch(marketActions.getGeneralInfoTokens())
  }

  verifyExchange = () => {
    var state = store.getState()
    
    var exchange = state.exchange
    if (exchange.step !== 1){
      return
    }

    store.dispatch(verifyExchange())
  }

  verifyTransfer = () => {
    var state = store.getState()
    var account = state.account.account
    if (!account.address) {
      return
    }

    var pathname = state.router.location.pathname
    if (!pathname.includes(constants.BASE_HOST + "/transfer")) {
      return
    }
    store.dispatch(verifyTransfer())
  }

  checkConnection = () => {
    var state = store.getState()
    var checker = state.global.conn_checker
    var ethereum = state.connection.ethereum
    store.dispatch(checkConnection(ethereum, checker.count, checker.maxCount, checker.isCheck))
  }

  checkKyberEnable = () => {
    store.dispatch(checkKyberEnable())
  }

  promiseOneNode(list, index, fn, callBackSuccess, callBackFail, ...args) {
    if (!list[index]) {
      callBackFail(new Error("Cannot resolve result: " + fn))
      return
    }
    if (!list[index][fn]) {
      console.log("Not have " + fn + " in " + list[index].rpcUrl)
      this.promiseOneNode(list, ++index, fn, callBackSuccess, callBackFail, ...args)
      return
    }
    list[index][fn](...args).then(result => {
      console.log("Resolve " + fn + "successful in " + list[index].rpcUrl)
      callBackSuccess(result)
    }).catch(err => {
      console.log(err.message + " -In provider: " + list[index].rpcUrl)
      this.promiseOneNode(list, ++index, fn, callBackSuccess, callBackFail, ...args)
    })
  }

  call(fn, ...args) {
    return new Promise((resolve, reject) => {
      this.promiseOneNode(this.listProviders, 0, fn, resolve, reject, ...args)
    })
  }


  promiseMultiNode(list, index, fn, callBackSuccess, callBackFail, results, errors, ...args) {
    if (!list[index]) {
      if(results.length > 0){
       // callBackSuccess(results[0])
       console.log("resolve "+fn+" successfully in some nodes")
      }else{
        callBackFail(errors)
      }      
      return
    }
    if (!list[index][fn]) {
      console.log(list[index].rpcUrl +  " not support func: " + fn)
      errors.push(new Error(list[index].rpcUrl +  " not support func: " + fn))
      this.promiseMultiNode(list, ++index, fn, callBackSuccess, callBackFail, results, errors, ...args)
      return
    }
    list[index][fn](...args).then(result => {      
      console.log("Call " + fn + " successfully in " + list[index].rpcUrl)
      results.push(result)
      this.promiseMultiNode(list, ++index, fn, callBackSuccess, callBackFail, results, errors, ...args)
      callBackSuccess(result)
    }).catch(err => {
      console.log(err.message + " -In provider: " + list[index].rpcUrl)
      errors.push(err)
      this.promiseMultiNode(list, ++index, fn, callBackSuccess, callBackFail, results, errors, ...args)
    })
  }

  callMultiNode(fn, ...args) {
    var errors = []
    var results = []
    return new Promise((resolve, reject) => {
      this.promiseMultiNode(this.listProviders, 0, fn, resolve, reject, results, errors, ...args)
    })
  }

}
