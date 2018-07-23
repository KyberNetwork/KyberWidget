import { take, put, call, fork, select, takeEvery, all, cancel } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import * as actions from '../actions/accountActions'
import { clearSession, setGasPrice, setBalanceToken } from "../actions/globalActions"
//import { fetchExchangeEnable, setApprove } from "../actions/exchangeActions"




import * as exchangeActions from "../actions/exchangeActions"

import { openInfoModal } from '../actions/utilActions'
import * as common from "./common"
import * as analytics from "../utils/analytics"

import { goToRoute, updateAllRate, updateAllRateComplete } from "../actions/globalActions"

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


function* createNewAccount(address, type, keystring, ethereum){
  try{
    const account = yield call(service.newAccountInstance, address, type, keystring, ethereum)
    return {status: "success", res: account}
  }catch(e){
    console.log(e)
    return {status: "fail"}
  }
}

export function* importNewAccount(action) {
  yield put(actions.importLoading())
  const { address, type, keystring, ethereum, tokens, metamask, screen } = action.payload
  var translate = getTranslate(store.getState().locale)
  try {
    var  account
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


    //track login wallet
    analytics.loginWallet(type)
    

    // if (screen === "exchange"){
    //   yield put(closeImportAccountExchange())
    // }else{
    //   yield put(closeImportAccountTransfer())
    // }
    

    //check whether user need approve
    if ((type === "keystore") || (type === "privateKey")){
      yield put(exchangeActions.setApprove(false))
    }else{
      var state = store.getState()
      var exchange = state.exchange
      var tokenMaps = {}
      Object.values(tokens).map(token => {
        var token = { ...token }
        tokenMaps[token.symbol] = token
      })

      if ((exchange.sourceTokenSymbol === exchange.destTokenSymbol) || (exchange.sourceTokenSymbol === "ETH")){
        yield put(exchangeActions.setApprove(false))
      }else{
        //get source amount 
        var sourceAmount = 0
        if (exchange.isHaveDestAmount){
          var minConversionRate = converter.toTWei(exchange.snapshot.minConversionRate)
          sourceAmount = converter.caculateSourceAmount(exchange.snapshot.destAmount, minConversionRate, 6)
          sourceAmount = converter.toTWei(sourceAmount, tokenMaps[exchange.sourceTokenSymbol].decimal)
        }else{
          sourceAmount = converter.toTWei(exchange.sourceAmount, tokenMaps[exchange.sourceTokenSymbol].decimal)
        }

         //get allowance
          var remain = yield call([ethereum, ethereum.call], "getAllowanceAtLatestBlock", tokenMaps[exchange.sourceTokenSymbol].address, address)
          remain = converter.hexToBigNumber(remain)

          console.log("check_remain")
          console.log(remain.toString())
          console.log(sourceAmount)
          if (converter.compareTwoNumber(remain, sourceAmount) !== -1) {
            yield put(exchangeActions.setApprove(false))
          }else{
            yield put(exchangeActions.setApprove(true))
          }

      }

     
    }
    
    yield put(exchangeActions.goToStep(3))

//    yield put(goToRoute(constants.BASE_HOST + '/swap'))

    yield put(exchangeActions.fetchExchangeEnable())

    var maxCapOneExchange = yield call([ethereum, ethereum.call], "getMaxCapAtLatestBlock", address)
    yield put(exchangeActions.setCapExchange(maxCapOneExchange))

    if (+maxCapOneExchange == 0){
      var linkReg = 'https://kybernetwork.zendesk.com'
      yield put(exchangeActions.thowErrorNotPossessKGt(translate("error.not_possess_kgt", {link: linkReg}) || "There seems to be a problem with your address, please contact us for more details"))
    }
    //update token and token balance
    

    yield call(ethereum.fetchRateExchange)

    console.log(address)
    const balanceTokens = yield call([ethereum, ethereum.call], "getAllBalancesTokenAtLatestBlock", address, tokens)
    //map balance
    var mapBalance = {}
    balanceTokens.map(token => {
      mapBalance[token.symbol] = token.balance
    })
    yield put(setBalanceToken(balanceTokens))
  }
  catch (err) {
    console.log(err)
    yield put(actions.throwError(translate("error.network_error") || "Cannot connect to node right now. Please check your network!"))
    yield put(actions.closeImportLoading())
  }




  //fork for metamask
  if (type === "metamask") {
    const { web3Service, address, networkId } = { ...metamask }
    const watchCoinbaseTask = yield fork(watchCoinbase, web3Service, address, networkId)

    yield take('GLOBAL.CLEAR_SESSION')
    yield cancel(watchCoinbaseTask)
  }
}

export function* importMetamask(action) {
  const { web3Service, networkId, ethereum, tokens, translate, screen } = action.payload
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
      ethereum,
      tokens,
      screen,
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
        yield put(clearSession())
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
