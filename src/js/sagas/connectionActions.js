import { put, call, fork, takeEvery } from 'redux-saga/effects'
import EthereumService from "../services/ethereum/ethereum"
import { setConnection } from "../actions/connectionActions"
import { setMaxGasPrice } from "../actions/exchangeActions"
import { delay } from 'redux-saga'
import { store } from "../store"
import * as globalActions from "../actions/globalActions"
import Web3Service from "../services/web3"
import BLOCKCHAIN_INFO from "../../../env"
import * as converter from "../utils/converter"
import * as common from "../utils/common"
import { getTranslate } from 'react-localize-redux'
import NotiService from "../services/noti_service/noti_service"

export function* createNewConnection() {
  var state = store.getState()
  var network = state.exchange.network
  var translate = getTranslate(state.locale)
  var connectionInstance = new EthereumService({network})

  yield put(setConnection(connectionInstance))
  yield put(setMaxGasPrice(connectionInstance))

  if (typeof web3 === "undefined") {
    yield put(globalActions.throwErrorMematamask(translate("error.metamask_not_installed") || "Metamask is not installed"))
  } else {
    const web3Service = new Web3Service(web3)
    const watchMetamask = yield fork(watchMetamaskAccount, connectionInstance, web3Service)
  }

  var notiService = new NotiService({ type: "session" })

  yield put(globalActions.setNotiHandler(notiService))
}

function* watchMetamaskAccount(ethereum, web3Service) {
  var state = store.getState()
  var exchange = state.exchange
  var translate = getTranslate(store.getState().locale)

  while (true) {
    try {
      var state = store.getState()
      const account = state.account.account
      if (account === false){
        //test network id
        const currentId = yield call([web3Service, web3Service.getNetworkId])
        const networkId = BLOCKCHAIN_INFO[exchange.network].networkId
        if (parseInt(currentId, 10) !== networkId) {
          const currentName = common.findNetworkName(parseInt(currentId, 10))
          const expectedName = common.findNetworkName(networkId)
          yield put(globalActions.throwErrorMematamask(translate("error.network_not_match", {expectedName: expectedName, currentName: currentName}) || `Metamask should be on ${expectedName}. Currently on ${currentName}`))
          return
        }

        //test address
        try {
          const coinbase = yield call([web3Service, web3Service.getCoinbase])
          const balanceBig = yield call([ethereum, ethereum.call], "getBalanceAtLatestBlock", coinbase)
          const balance = converter.roundingNumber(converter.toEther(balanceBig))
          yield put(globalActions.updateMetamaskAccount(coinbase, balance))
        } catch (e) {
          yield put(globalActions.throwErrorMematamask(translate("error.cannot_connect_metamask") || `Cannot get metamask account. You probably did not login in Metamask`))
        }
      }
    } catch (e) {
      yield put(globalActions.throwErrorMematamask(e.message))
    }

    yield call(delay, 5000)
  }
}

export function* watchConnection() {
  yield takeEvery("CONNECTION.CREATE_NEW_CONNECTION", createNewConnection)
}
