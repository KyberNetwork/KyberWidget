import { take, put, call, fork, select, takeEvery, all, cancel } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import * as actions from '../actions/accountActions'
import { clearSession, setGasPrice, setBalanceToken, goToRoute, updateAllRate, updateAllRateComplete } from "../actions/globalActions"
//import { fetchExchangeEnable, setApprove } from "../actions/exchangeActions"




import * as exchangeActions from "../actions/exchangeActions"

import * as utilActions from '../actions/utilActions'


import * as common from "./common"
import * as analytics from "../utils/analytics"

//import {  } from "../actions/globalActions"

//import { randomForExchange } from "../utils/random"

import * as service from "../services/accounts"
import constants from "../services/constants"
import { Rate, updateAllRatePromise } from "../services/rate"

import * as converter from "../utils/converter"
import * as commonFunc from "../utils/common"

import { getTranslate } from 'react-localize-redux'
import { store } from '../store';

export function* updateAccount(action) {
  const { account, ethereum } = action.payload
  try {
    const newAccount = yield call(account.sync, ethereum, account)
    yield put(actions.updateAccountComplete(newAccount))
  } catch (err) {
    console.log(err)
  }

}

export function* updateTokenBalance(action) {
  try {
    const { ethereum, address, tokens } = action.payload
    const balanceTokens = yield call([ethereum, ethereum.call], "getAllBalancesTokenAtLatestBlock", address, tokens)
    yield put(setBalanceToken(balanceTokens))
  }
  catch (err) {
    console.log(err)
  }
}


function* checkApproveAccount(address, type) {
  var state = store.getState()
  var exchange = state.exchange
  var tokens = state.tokens.tokens
  var ethereum = state.connection.ethereum

  if ((type === "keystore") || (type === "privateKey")) {
    yield put(exchangeActions.setApprove(false))
  } else {
    // var tokenMaps = {}
    // Object.values(tokens).map(token => {
    //   var token = { ...token }
    //   tokenMaps[token.symbol] = token
    // })
    // if ((exchange.sourceTokenSymbol === exchange.destTokenSymbol) || (exchange.sourceTokenSymbol === "ETH")) {
    //   yield put(exchangeActions.setApprove(false))
    // } else {
    //get source amount 
    //var sourceAmount = 0
    //if (exchange.isHaveDestAmount) {
    var minConversionRate = exchange.snapshot.minConversionRate
    var monsterInETH = converter.toEther(exchange.snapshot.monsterInETH)
    var sourceAmount = converter.caculateSourceAmount(monsterInETH, minConversionRate, 6)
    sourceAmount = converter.toTWei(sourceAmount, tokens[exchange.sourceTokenSymbol].decimal)
    // } else {
    //   sourceAmount = converter.toTWei(exchange.sourceAmount, tokens[exchange.sourceTokenSymbol].decimal)
    // }
    //get allowance
    var remain = yield call([ethereum, ethereum.call], "getAllowanceAtLatestBlock", tokens[exchange.sourceTokenSymbol].address, address)

    console.log("remaining")
    console.log(remain)
    console.log(sourceAmount)

    remain = converter.hexToBigNumber(remain)

    // console.log("check_remain")
    // console.log(remain.toString())
    // console.log(sourceAmount)
    if (converter.compareTwoNumber(remain, sourceAmount) !== -1) {
      yield put(exchangeActions.setApprove(false))
    } else {
      yield put(exchangeActions.setApprove(true))
    }
    // }
  }
}

function* checkMaxCap(address) {
  var state = store.getState()
  var exchange = state.exchange
  var tokens = state.tokens.tokens
  var ethereum = state.connection.ethereum
  const translate = getTranslate(state.locale)
  var sourceTokenSymbol = exchange.sourceTokenSymbol

  if (exchange.sourceTokenSymbol === exchange.destTokenSymbol) {
    return
  }

  var maxCapOneExchange = yield call([ethereum, ethereum.call], "getMaxCapAtLatestBlock", address)
  yield put(exchangeActions.setCapExchange(maxCapOneExchange))

  if (+maxCapOneExchange == 0) {
    var linkReg = 'https://kybernetwork.zendesk.com'
    yield put(exchangeActions.thowErrorNotPossessKGt(translate("error.not_possess_kgt", { link: linkReg }) || "There seems to be a problem with your address, please contact us for more details"))
    return
  } else {
    yield put(exchangeActions.thowErrorNotPossessKGt(""))
  }

  var destAmount = converter.toEther(exchange.monsterInETH)
  var minConversionRate = exchange.minConversionRate
  var srcAmount = converter.caculateSourceAmount(destAmount, minConversionRate, 6)
  srcAmount = converter.toTWei(srcAmount, tokens[sourceTokenSymbol].decimal)

  // var srcAmount
  // var sourceTokenSymbol = exchange.sourceTokenSymbol
  // if (exchange.isHaveDestAmount) {
  //   var destAmount = exchange.destAmount
  //   var minConversionRate = converter.toTWei(exchange.minConversionRate, 18)
  //   srcAmount = converter.caculateSourceAmount(exchange.destAmount, minConversionRate, 6)
  //   srcAmount = converter.toTWei(srcAmount, tokens[sourceTokenSymbol].decimal)

  // } else {
  //   srcAmount = exchange.sourceAmount
  //   srcAmount = converter.toTWei(srcAmount, tokens[sourceTokenSymbol].decimal)
  //   // if (converter.compareTwoNumber(srcAmount, maxCapOneExchange) === 1){
  //   //   var maxCap = converter.toEther(maxCapOneExchange)
  //   //   yield put(exchangeActions.throwErrorExchange("exceed_cap", translate("error.source_amount_too_high_cap", { cap: maxCap })))
  //   // }
  // }

  //if (sourceTokenSymbol !== "ETH") {
    var rate = tokens[sourceTokenSymbol].rate
    var decimal = tokens[sourceTokenSymbol].decimal
    srcAmount = converter.toT(srcAmount, decimal)
    srcAmount = converter.caculateDestAmount(srcAmount, rate, 6)
    srcAmount = converter.toTWei(srcAmount, 18)
 // }
  // console.log("source_amount")
  // console.log(srcAmount)
  // console.log(maxCapOneExchange)
  if (converter.compareTwoNumber(srcAmount, maxCapOneExchange) === 1) {
    var maxCap = converter.toEther(maxCapOneExchange)
    yield put(exchangeActions.throwErrorExchange("exceed_cap", translate("error.source_amount_too_high_cap", { cap: maxCap * constants.MAX_CAP_PERCENT })))
  } else {
    yield put(exchangeActions.throwErrorExchange("exceed_cap", ""))
  }

}


function* checkBalance(address) {
  var state = store.getState()
  var exchange = state.exchange
  var tokens = state.tokens.tokens
  var ethereum = state.connection.ethereum
  const translate = getTranslate(state.locale)

  var listTokens = {
    "ETH": { ...tokens["ETH"] }
  }
  var sourceTokenSymbol = exchange.sourceTokenSymbol
  if (sourceTokenSymbol !== "ETH") {
    listTokens[sourceTokenSymbol] = { ...tokens[sourceTokenSymbol] }
  }

  const balanceTokens = yield call([ethereum, ethereum.call], "getAllBalancesTokenAtLatestBlock", address, listTokens)


  //map balance
  var mapBalance = {}
  balanceTokens.map(token => {
    mapBalance[token.symbol] = token.balance
  })
  yield put(setBalanceToken(mapBalance))


  // if (exchange.sourceTokenSymbol === exchange.destTokenSymbol){

  // }

  //check whether balance is sufficient  
  var srcAmount
  if (exchange.isHaveDestAmount) {
    var destAmount = exchange.destAmount

    if (exchange.sourceTokenSymbol === exchange.destTokenSymbol) {
      srcAmount = converter.toTWei(destAmount, tokens[sourceTokenSymbol].decimal)
    } else {
      var minRate = exchange.minConversionRate
      srcAmount = converter.caculateSourceAmount(exchange.destAmount, minRate, 6)
      srcAmount = converter.toTWei(srcAmount, tokens[sourceTokenSymbol].decimal)
    }
  } else {
    srcAmount = exchange.sourceAmount
    //var sourceTokenSymbol = exchange.sourceTokenSymbol
    srcAmount = converter.toTWei(srcAmount, tokens[sourceTokenSymbol].decimal)
  }
  if (sourceTokenSymbol !== "ETH") {
    var srcBalance = mapBalance[sourceTokenSymbol]
    if (converter.compareTwoNumber(srcBalance, srcAmount) === -1) {
      yield put(exchangeActions.throwErrorExchange("exceed_balance", translate("error.source_amount_too_high") || "Source amount is over your balance"))
    } else {
      yield put(exchangeActions.throwErrorExchange("exceed_balance", ""))
    }
  }

  //validate tx fee
  var txFee
  if (exchange.isNeedApprove) {
    txFee = converter.calculateGasFee(exchange.gasPrice, (exchange.gas + exchange.gas_approve))
  } else {
    txFee = converter.calculateGasFee(exchange.gasPrice, exchange.gas)
  }
  txFee = converter.toTWei(txFee, 18)

  var balanceETH = mapBalance["ETH"]

  // console.log("balance_eth")
  // console.log(balanceETH)
  // console.log(txFee)
  // console.log(sourceTokenSymbol)

  if (sourceTokenSymbol !== "ETH") {
    // console.log(converter.compareTwoNumber(balanceETH, txFee))
    if (converter.compareTwoNumber(balanceETH, txFee) === -1) {
      yield put(exchangeActions.throwErrorExchange("exceed_balance_fee", translate("error.eth_balance_not_enough_for_fee") || "Your balance is not enough for this transaction"))
    } else {
      yield put(exchangeActions.throwErrorExchange("exceed_balance_fee", ""))
    }
  } else {

    txFee = converter.addTwoNumber(txFee, srcAmount)
    // console.log(converter.compareTwoNumber(balanceETH, txFee))
    if (converter.compareTwoNumber(balanceETH, txFee) === -1) {
      yield put(exchangeActions.throwErrorExchange("exceed_balance_fee", translate("error.eth_balance_not_enough_for_fee") || "Your balance is not enough for this transaction"))
    } else {
      yield put(exchangeActions.throwErrorExchange("exceed_balance_fee", ""))
    }
  }
}

function* checkSigner(address) {
  var state = store.getState()
  var exchange = state.exchange
  const translate = getTranslate(state.locale)

  if (exchange.signer) {
    var listAddr = exchange.signer.split("_")
    for (var i = 0; i < listAddr.length; i++) {
      if (address.toLowerCase() === listAddr[i].toLowerCase()) {
        return
      }
    }
    yield put(exchangeActions.throwErrorExchange("signer_invalid", translate("error.signer_invalid") || "You access an invalid address"))
  } else {
    yield put(exchangeActions.throwErrorExchange("signer_invalid", ""))
  }
}


// function* fetchingGasTransfer(){}
function* fetchingGas(address) {
  var state = store.getState()
  var exchange = state.exchange
  var ethereum = state.connection.ethereum
  // console.log("ethereum_conector")
  // console.log(ethereum)
  //temporaly hardcode for exchange gas limit
  if (exchange.sourceTokenSymbol !== exchange.destTokenSymbol) {
    return
  }
  yield put(exchangeActions.fetchGas())
  //if transfer estimate
  var tokens = state.tokens.tokens
  var decimal = tokens[exchange.sourceTokenSymbol].decimal
  var amount
  if (exchange.isHaveDestAmount) {
    amount = converter.stringToHex(exchange.destAmount, decimal)
  } else {
    amount = converter.stringToHex(exchange.sourceAmount, decimal)
  }

  var destAddr = exchange.receiveAddr

  var txObj
  if (exchange.sourceTokenSymbol === "ETH") {
    txObj = {
      from: address,
      value: amount,
      to: destAddr
    }
  } else {
    var tokenAddr = tokens[exchange.sourceTokenSymbol].address
    var data = yield call([ethereum, ethereum.call], "sendTokenData", tokenAddr, amount, destAddr)
    txObj = {
      from: address,
      value: "0",
      to: tokenAddr,
      data: data
    }
  }
  var gas
  try {
    var gas = yield call([ethereum, ethereum.call], "estimateGas", txObj)
    if (exchange.sourceTokenSymbol !== "ETH") {
      gas = Math.round(gas * 120 / 100)
    }
  } catch (e) {
    console.log(e)
    gas = 250000
    //yield put(exchangeActions.throwErrorExchange("gas_estimate", translate("error.gas_estimate") || "Exceed gas"))    
  }
  yield put(exchangeActions.setEstimateGas(gas, 0))
  yield put(exchangeActions.fetchGasSuccess())
}

function* createNewAccount(address, type, keystring, ethereum) {
  try {
    const account = yield call(service.newAccountInstance, address, type, keystring, ethereum)
    return { status: "success", res: account }
  } catch (e) {
    console.log(e)
    return { status: "fail" }
  }
}

export function* importNewAccount(action) {
  yield put(actions.importLoading())

  var state = store.getState()
  var ethereum = state.connection.ethereum

  const { address, type, keystring, metamask } = action.payload
  var translate = getTranslate(store.getState().locale)
  try {
    var account
    var accountRequest = yield call(common.handleRequest, createNewAccount, address, type, keystring, ethereum)

    if (accountRequest.status === "timeout") {
      console.log("timeout")
      let translate = getTranslate(store.getState().locale)
      yield put(actions.closeImportLoading())
      yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
        translate("error.node_error") || "There are some problems with nodes. Please try again in a while."))
      return
    }
    if (accountRequest.status === "fail") {
      let translate = getTranslate(store.getState().locale)
      yield put(actions.closeImportLoading())
      yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
        translate("error.network_error") || "Cannot connect to node right now. Please check your network!"))
      return
    }

    if (accountRequest.status === "success") {
      account = accountRequest.data
    }

    // const account = yield call(service.newAccountInstance, address, type, keystring, ethereum)
    yield put(actions.closeImportLoading())
    yield put(actions.importNewAccountComplete(account))


    yield put(exchangeActions.goToStep(3))

    //track login wallet
    analytics.loginWallet(type)


    // if (screen === "exchange"){
    //   yield put(closeImportAccountExchange())
    // }else{
    //   yield put(closeImportAccountTransfer())
    // }


    //yield call(fetchingGas, address)

    //check whether user need approve
    yield call(checkApproveAccount, address, type)

    yield call(checkMaxCap, address)

    yield call(checkBalance, address)

    yield call(checkSigner, address)

    yield put(exchangeActions.validateAccountComplete())
    //yield put.sync(actions.resetImportAccount())

    //    yield put(goToRoute(constants.BASE_HOST + '/swap'))

    //    yield put(exchangeActions.fetchExchangeEnable())


    //update token and token balance


    // yield call(ethereum.fetchRateExchange)


  } catch (err) {
    console.log(err)
    yield put(actions.throwError(translate("error.network_error") || "Cannot connect to node right now. Please check your network!"))
    yield put(actions.closeImportLoading())
  }



  //fork for metamask
  if (type === "metamask") {
    const { web3Service, address, networkId } = { ...metamask }
    const watchCoinbaseTask = yield fork(watchCoinbase, web3Service, address, networkId)

    yield take('ACCOUNT.CLEAR_WATCH_METAMASK')
    yield cancel(watchCoinbaseTask)
  }
}

export function* importMetamask(action) {
  var translate = getTranslate(store.getState().locale)

  const { web3Service, networkId } = action.payload
  try {
    const currentId = yield call([web3Service, web3Service.getNetworkId])
    if (parseInt(currentId, 10) !== networkId) {
      var currentName = commonFunc.findNetworkName(parseInt(currentId, 10))
      var expectedName = commonFunc.findNetworkName(networkId)
      if (currentName) {
        yield put(actions.throwError(translate("error.network_not_match", { currentName: currentName, expectedName: expectedName }) || "Network is not match"))
        return
      } else {
        yield put(actions.throwError(translate("error.network_not_match_unknow", { expectedName: expectedName }) || "Network is not match"))
        return
      }
    }
    //get coinbase
    const address = yield call([web3Service, web3Service.getCoinbase])
    yield call([web3Service, web3Service.setDefaultAddress, address])

    const metamask = { web3Service, address, networkId }
    yield put(actions.importNewAccount(
      address,
      "metamask",
      web3Service,
      metamask
    ))
  } catch (e) {
    console.log(e)
    yield put(actions.throwError(translate("error.cannot_connect_metamask") || "Cannot get metamask account. You probably did not login in Metamask"))
  }
}


function* watchCoinbase(web3Service, address, networkId) {
  while (true) {
    try {
      yield call(delay, 500)
      const coinbase = yield call([web3Service, web3Service.getCoinbase])
      if (coinbase !== address) {
        //check address
        //var metamask = { web3Service, address, networkId }

        //clear all error in exchange screen
        yield put(actions.importAccountMetamask(
          web3Service,
          networkId
        ))

        // yield put(clearSession())
        return
      }
      const currentId = yield call([web3Service, web3Service.getNetworkId])
      if (parseInt(currentId, 10) !== networkId) {
        console.log(currentId)
        yield put(clearSession())
        return
      }
      //check 
    } catch (error) {
      console.log(error)
      yield put(clearSession())
      return;
    }
  }
}

export function* watchAccount() {
  yield takeEvery("ACCOUNT.UPDATE_ACCOUNT_PENDING", updateAccount)
  yield takeEvery("ACCOUNT.IMPORT_NEW_ACCOUNT_PENDING", importNewAccount)
  yield takeEvery("ACCOUNT.IMPORT_ACCOUNT_METAMASK", importMetamask)
  yield takeEvery("ACCOUNT.UPDATE_TOKEN_BALANCE", updateTokenBalance)

}
