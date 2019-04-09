import { take, put, call, fork, takeEvery, cancel } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import * as actions from '../actions/accountActions'
import { clearSession, setBalanceToken } from "../actions/globalActions"
import * as exchangeActions from "../actions/exchangeActions"
import * as utilActions from '../actions/utilActions'
import * as common from "./common"
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
  const state = store.getState();
  const exchange = state.exchange;
  const tokens = state.tokens.tokens;
  const ethereum = state.connection.ethereum;
  const isPayMode = !exchange.isSwap;
  const isSameToken = exchange.sourceTokenSymbol === exchange.destTokenSymbol;
  const isSourceTokenETH = exchange.sourceTokenSymbol === "ETH"

  yield call(resetApproveState);

  if (type === "keystore" || type === "privateKey") return;

  if (!isSourceTokenETH) {
    let sourceAmount = 0;

    if (exchange.isHaveDestAmount && isSameToken) {
      sourceAmount = converter.toTWei(exchange.snapshot.destAmount, tokens[exchange.sourceTokenSymbol].decimals);
    } else if (exchange.isHaveDestAmount) {
      const minConversionRate = converter.toTWei(exchange.snapshot.minConversionRate);
      sourceAmount = converter.caculateSourceAmount(exchange.snapshot.destAmount, minConversionRate, 6);
      sourceAmount = converter.toTWei(sourceAmount, tokens[exchange.sourceTokenSymbol].decimals);
    } else {
      sourceAmount = converter.toTWei(exchange.sourceAmount, tokens[exchange.sourceTokenSymbol].decimals);
    }

    let remain = yield call([ethereum, ethereum.call], "getAllowanceAtLatestBlock",
      tokens[exchange.sourceTokenSymbol].address, address, isPayMode);
    remain = converter.hexToBigNumber(remain);

    if (converter.compareTwoNumber(remain, sourceAmount) !== -1) {
      yield call(resetApproveState);
    } else if (remain != 0) {
      yield call(setApproveState, true);
    } else {
      yield call(setApproveState, false);
    }
  }
}

function *setApproveState(isApproveZero) {
  yield put(exchangeActions.setIsApproveZero(isApproveZero));
  yield put(exchangeActions.setApprove(!isApproveZero));
}

function *resetApproveState() {
  yield put(exchangeActions.setApprove(false));
  yield put(exchangeActions.setIsApproveZero(false));
}

function* checkMaxCap(address) {
  var state = store.getState()
  var exchange = state.exchange
  var tokens = state.tokens.tokens
  var ethereum = state.connection.ethereum
  var global = state.global
  const translate = getTranslate(state.locale)

  if (global.params.mode === 'popup') {
    yield put(exchangeActions.throwErrorExchange("exceed_cap", ""))
    return
  }
  
  var sourceTokenSymbol = exchange.sourceTokenSymbol
  if (exchange.sourceTokenSymbol === exchange.destTokenSymbol) {
    yield put(exchangeActions.throwErrorExchange("exceed_cap", ""))
    return
  }
  
  try {
    var result = yield call([ethereum, ethereum.call], "getUserMaxCap", address)

    var maxCapOneExchange = result.cap

    yield put(exchangeActions.setCapExchange(maxCapOneExchange))

    if (+maxCapOneExchange == 0) {
      var linkReg = 'https://kybernetwork.zendesk.com'
      yield put(exchangeActions.thowErrorNotPossessKGt(translate("error.not_possess_kgt", { link: linkReg }) || "There seems to be a problem with your address, please contact us for more details"))
      return
    } else {
      yield put(exchangeActions.thowErrorNotPossessKGt(""))
    }

    var srcAmount
    var sourceTokenSymbol = exchange.sourceTokenSymbol    
    if (exchange.isHaveDestAmount) {
      var minConversionRate = converter.toTWei(exchange.minConversionRate, 18)
      srcAmount = converter.caculateSourceAmount(exchange.destAmount, minConversionRate, 6)
      srcAmount = converter.toTWei(srcAmount, tokens[sourceTokenSymbol].decimals)

    } else {
      srcAmount = exchange.sourceAmount
      srcAmount = converter.toTWei(srcAmount, tokens[sourceTokenSymbol].decimals)
    }

    if (sourceTokenSymbol !== "ETH") {
      var rate = tokens[sourceTokenSymbol].rate
      srcAmount = converter.toT(srcAmount, tokens[sourceTokenSymbol].decimals)
      srcAmount = converter.caculateDestAmount(srcAmount, rate, 6)
      srcAmount = converter.toTWei(srcAmount, 18)
    }

    if (converter.compareTwoNumber(srcAmount, maxCapOneExchange) === 1) {
      var maxCap = converter.toEther(maxCapOneExchange)
      yield put(exchangeActions.throwErrorExchange("exceed_cap", translate("error.source_amount_too_high_cap", { cap: maxCap * constants.MAX_CAP_PERCENT })))
    } else {
      yield put(exchangeActions.throwErrorExchange("exceed_cap", ""))
    }

  } catch (err) {
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

  //check whether balance is sufficient
  var srcAmount
  if (exchange.isHaveDestAmount) {
    var destAmount = exchange.destAmount

    if (exchange.sourceTokenSymbol === exchange.destTokenSymbol) {
      srcAmount = converter.toTWei(destAmount, tokens[sourceTokenSymbol].decimals)
    } else {
      var minRate = converter.toTWei(exchange.minConversionRate, 18)
      srcAmount = converter.caculateSourceAmount(exchange.destAmount, minRate, 6)
      srcAmount = converter.toTWei(srcAmount, tokens[sourceTokenSymbol].decimals)
    }
  } else {
    srcAmount = exchange.sourceAmount
    srcAmount = converter.toTWei(srcAmount, tokens[sourceTokenSymbol].decimals)
  }

  var srcBalance = mapBalance[sourceTokenSymbol]
  if (converter.compareTwoNumber(srcBalance, srcAmount) === -1) {
    yield put(exchangeActions.throwErrorExchange("exceed_balance", translate("error.source_amount_too_high") || "Source amount is over your balance"))
  } else {
    yield put(exchangeActions.throwErrorExchange("exceed_balance", ""))
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

  if (sourceTokenSymbol !== "ETH") {
    if (converter.compareTwoNumber(balanceETH, txFee) === -1) {
      yield put(exchangeActions.throwErrorExchange("exceed_balance_fee", translate("error.eth_balance_not_enough_for_fee")))
    } else {
      yield put(exchangeActions.throwErrorExchange("exceed_balance_fee", ""))
    }
  } else {
    txFee = converter.addTwoNumber(txFee, srcAmount)
    if (converter.compareTwoNumber(balanceETH, txFee) === -1) {
      yield put(exchangeActions.throwErrorExchange("exceed_balance_fee", translate("error.eth_balance_not_enough_for_fee")))
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
    yield put(exchangeActions.throwErrorExchange("signer_invalid", translate("error.signer_invalid")))
  } else {
    yield put(exchangeActions.throwErrorExchange("signer_invalid", ""))
  }
}

function* checkReceiveAddress(address) {
  var state = store.getState()
  var global = state.global
  if (global.params.receiveAddr === 'self') {
    yield put.resolve(exchangeActions.updateReceiveAddress(address))
  }
  return
}


function* fetchingGas(address) {
  const state = store.getState();
  const exchange = state.exchange;
  const isETHSource = exchange.sourceTokenSymbol === "ETH";
  let gas;
  let gasApprove = exchange.gas_approve


  //temporarily hard-code for exchange gas limit
  if (exchange.sourceTokenSymbol !== exchange.destTokenSymbol) {
    return
  }

  yield put(exchangeActions.fetchGas());

  if (isETHSource) {
    gas = yield common.estimateEthTransfer(address);
  } else {
    gas = constants.PAYMENT_TOKEN_TRANSFER_GAS;
  }

  yield put(exchangeActions.setEstimateGas(gas, gasApprove));
  yield put(exchangeActions.fetchGasSuccess());
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

    yield call(checkReceiveAddress, address)
    yield put(actions.closeImportLoading())
    yield put(actions.importNewAccountComplete(account))
    yield put(exchangeActions.goToStep(3))

    //track login wallet
    state.global.analytics.callTrack("loginWallet", type)

    yield call(fetchingGas, address)

    //check whether user need approve
    yield call(checkApproveAccount, address, type)

    yield call(checkMaxCap, address)

    yield call(checkBalance, address)

    yield call(checkSigner, address)

    yield put(exchangeActions.validateAccountComplete())
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
        yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
          translate("error.network_not_match", { currentName: currentName, expectedName: expectedName }) || "Network is not match"))
        return
      } else {
        yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
          translate("error.network_not_match_unknow", { expectedName: expectedName }) || "Network is not match"))
        return
      }
    }
    //get coinbase
    const address = yield call([web3Service, web3Service.getCoinbase], true)
    yield call([web3Service, web3Service.setDefaultAddress, address])

    const metamask = { web3Service, address, networkId }
    yield put(actions.importNewAccount(
      address,
      "metamask",
      web3Service,
      metamask
    ))
  } catch (e) {
    yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
      translate("error.cannot_connect_metamask") || "Cannot get metamask account. You probably did not login in Metamask"))
  }
}


function* watchCoinbase(web3Service, address, networkId) {
  while (true) {
    var state = store.getState()
    if (!commonFunc.checkComponentExist(state.global.params.appId)) {
      return
    }
    try {
      yield call(delay, 500)
      const coinbase = yield call([web3Service, web3Service.getCoinbase])
      if (coinbase !== address) {
        //check address
        yield put(actions.importAccountMetamask(
          web3Service,
          networkId
        ))

        return
      }
      const currentId = yield call([web3Service, web3Service.getNetworkId])
      if (parseInt(currentId, 10) !== networkId) {
        console.log(currentId)
        yield put(clearSession())
        return
      }
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
