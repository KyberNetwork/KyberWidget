import { take, put, call, fork, takeEvery, cancel } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import * as actions from '../actions/exchangeActions'
import * as globalActions from "../actions/globalActions"
import { setConnection } from "../actions/connectionActions"
import EthereumService from "../services/ethereum/ethereum"
import NotiService from "../services/noti_service/noti_service"
import * as web3Package from "../services/web3"
import * as common from "./common"
import * as commonFunc from "../utils/common"
import { updateAccount, incManualNonceAccount } from '../actions/accountActions'
import { addTx } from '../actions/txActions'
import * as utilActions from '../actions/utilActions'
import constants from "../services/constants"
import * as converter from "../utils/converter"
import * as ethUtil from 'ethereumjs-util'
import Tx from "../services/tx"
import { getTranslate } from 'react-localize-redux';
import { store } from '../store'
import BLOCKCHAIN_INFO from "../../../env"
import * as widgetOptions from "../utils/widget-options"

export function* processExchange(action) {
  const { type, sourceToken } = action.payload;

  yield put(actions.resetSignError());

  if (sourceToken === constants.ETHER_ADDRESS) {
    switch (type) {
      case "keystore":
        yield call(exchangeETHtoTokenKeystore, action)
        break
      case "privateKey":
        yield call(exchangeETHtoTokenPrivateKey, action)
        break
      case "trezor":
      case "ledger":
        yield call(exchangeETHtoTokenColdWallet, action)
        break
      case "metamask":
        yield call(exchangeETHtoTokenMetamask, action)
        break
    }
  } else {
    switch (type) {
      case "keystore":
        yield call(exchangeTokentoETHKeystore, action)
        break
      case "privateKey":
        yield call(exchangeTokentoETHPrivateKey, action)
        break
      case "metamask":
        yield call(exchangeTokentoETHMetamask, action)
        break
      case "trezor":
      case "ledger":
        yield call(exchangeTokentoETHColdWallet, action)
        break
    }
  }
}

function* approveTx(action) {
  try {
    const { ethereum, tx, callback } = action.payload
    const hash = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", tx)
    callback(hash, tx)
    yield put(actions.doApprovalTransactionComplete(hash, action.meta))
  }
  catch (e) {
    console.log(e)
    yield put(actions.doApprovalTransactionFail(e.message, action.meta))
  }
}

function* swapToken(action) {
  const {source, dest} = action.payload
  yield call(estimateGasUsed,dest, source)
}

function* changeInputValue() {
  const state = store.getState();
  const srcSymbol = state.exchange.sourceTokenSymbol;
  const destSymbol = state.exchange.destTokenSymbol;

  yield call(estimateGasUsed, srcSymbol, destSymbol);
}

function* selectToken(action) {
  const { symbol, address, type, ethereum } = action.payload
  const translate = getTranslate(store.getState().locale);

  yield put.resolve(actions.selectToken(symbol, address, type))
  yield put(utilActions.hideSelectToken())
  yield put(actions.checkSelectToken(translate("error.select_same_token")))

  var state = store.getState()
  var exchange = state.exchange

  if (type === 'source') {
    yield call(estimateGasUsed, symbol, exchange.destTokenSymbol)
  } else {
    yield call(estimateGasUsed, exchange.sourceTokenSymbol, symbol)
  }

  if (exchange.sourceTokenSymbol === exchange.destTokenSymbol) {
    yield put(actions.selectTokenComplete())
    return
  }

  if (exchange.isHaveDestAmount) {
    if (exchange.destTokenSymbol === "ETH") {
      if (parseFloat(exchange.destAmount) > constants.MAX_AMOUNT_RATE_HANDLE) {
        yield put(actions.throwErrorHandleAmount());
        yield put(actions.selectTokenComplete());
        return
      }
    } else {
      var tokens = state.tokens.tokens
      var destValue = converter.calculateDest(exchange.destAmount, tokens[exchange.destTokenSymbol].rate, 6)

      if (parseFloat(destValue) > constants.MAX_AMOUNT_RATE_HANDLE) {
        yield put(actions.throwErrorHandleAmount());
        yield put(actions.selectTokenComplete());
        return
      }
    }
    yield call(ethereum.fetchRateExchange, true)
  } else {
    yield call(ethereum.fetchRateExchange, true)
  }
}

export function* estimateGasUsed(source, dest) {
  const state = store.getState();
  const exchange = state.exchange;
  const tokens = state.tokens.tokens;
  let gasUsed;
  let gasApproved = 0;

  if (exchange.type === "pay") {
    if (source === dest) {
      const specialGasLimit = constants.SPECIAL_PAYMENT_GAS_LIMIT[source];
      
      if (specialGasLimit) {
        gasUsed = specialGasLimit.gasUsed;
        gasApproved = specialGasLimit.gasApproved;
      } else {
        gasUsed = constants.SPECIAL_PAYMENT_GAS_LIMIT['default'].gasUsed;
        gasApproved = constants.SPECIAL_PAYMENT_GAS_LIMIT['default'].gasApproved;
      }
    } else {
      gasUsed = yield call(getMaxGasExchange, source, dest)
      gasApproved = yield call(getMaxGasApprove, tokens[source].gasApprove)
    }
  } else {
    if (source === dest) {
      const specialGasLimit = constants.SPECIAL_OTHER_GAS_LIMIT[source];
      
      if (specialGasLimit) {
        gasUsed = specialGasLimit.gasUsed;
      } else {
        gasUsed = constants.SPECIAL_OTHER_GAS_LIMIT['default'].gasUsed;
      }
      
      gasApproved = 0
    } else {
      gasUsed = yield call(getMaxGasExchange, source, dest);
      
      if (source !== "ETH") {
        gasApproved = yield call(getMaxGasApprove, tokens[source].gasApprove)
      }
    }
  }

  yield put(actions.setEstimateGas(gasUsed, gasApproved))
}

export function* runAfterBroadcastTx(ethereum, txRaw, hash, account, data) {

  if(account.type === 'metamask'){
     yield put (actions.goToStep(4))
  }

  try {
    yield call(getInfo, hash)
  } catch (e) {
    console.log(e)
  }

  //track complete trade
  var state = store.getState()
  var exchange = state.exchange
  var analytics = state.global.analytics

  analytics.callTrack("completeTransaction", exchange.sourceTokenSymbol, exchange.destTokenSymbol)

  yield fork(common.submitCallback, hash)

  const tx = new Tx(
    hash, account.address, ethUtil.bufferToInt(txRaw.gas),
    converter.weiToGwei(ethUtil.bufferToInt(txRaw.gasPrice)),
    ethUtil.bufferToInt(txRaw.nonce), "pending", "exchange", data)
  yield put(incManualNonceAccount(account.address))
  yield put(updateAccount(ethereum, account))
  yield put(addTx(tx))
  yield put(actions.doTransactionComplete(hash))
  yield put(actions.finishExchange())
  yield put(actions.resetSignError())
  widgetOptions.postMessageBroadCasted(tx.hash);
}

function* getInfo(hash) {
  var state = store.getState()
  var ethereum = state.connection.ethereum

  yield call([ethereum, ethereum.call], "getInfo", { hash })
}

function* doTxFail(ethereum, account, e) {
  var state = store.getState()
  var exchange = state.exchange
  yield put(actions.goToStep(4));

  var error = e
  if (!error) {
    var translate = getTranslate(store.getState().locale)
    var link = BLOCKCHAIN_INFO[exchange.network].ethScanUrl + "address/" + account.address
    error = translate("error.broadcast_tx", { link: link }) || "Potentially Failed! We likely couldn't broadcast the transaction to the blockchain. Please check on Etherscan to verify."
  }
  yield put(actions.setBroadcastError(error))
}


function isApproveTxPending() {
  //check have approve tx
  const state = store.getState()
  const tokens = state.tokens.tokens
  const sourceTokenSymbol = state.exchange.sourceTokenSymbol
  return !!tokens[sourceTokenSymbol].approveTx
}

export function* checkTokenBalanceOfColdWallet(action) {
  const { ethereum, address, sourceToken, sourceAmount } = action.payload
  let translate = getTranslate(store.getState().locale)
  const isPayMode = checkIsPayMode();

  try {
    const remainStr = yield call([ethereum, ethereum.call], "getAllowanceAtLatestBlock", sourceToken, address, isPayMode)
    const remain = converter.hexToBigNumber(remainStr)
    const sourceAmountBig = converter.hexToBigNumber(sourceAmount)

    if (!remain.isGreaterThanOrEqualTo(sourceAmountBig) && !isApproveTxPending()) {
      yield put(actions.showApprove())
      yield call(fetchGasApproveSnapshot)
    } else {
      yield put(actions.showConfirm())
      yield call(fetchGasConfirmSnapshot)
    }
  } catch (e) {
    let title = translate("error.error_occurred") || "Error occurred"
    let content = translate("error.network_error") || "Cannot connect to node right now. Please check your network!"
    yield put(utilActions.openInfoModal(title, content))
  }
}

function* processApprove(action) {
  const { accountType } = action.payload

  yield put(actions.resetSignError());

  switch (accountType) {
    case "trezor":
    case "ledger":
      yield call(processApproveByColdWallet, action)
      break
    case "metamask":
      yield call(processApproveByMetamask, action)
      break
  }
}

export function* processApproveByColdWallet(action) {
  const { ethereum, sourceToken, sourceAmount, nonce, gas, gasPrice, keystring,
    password, accountType, account, keyService, sourceTokenSymbol, isApproveZero } = action.payload

  var networkId = common.getNetworkId()
  let rawApprove
  const isPayMode = checkIsPayMode();

  try {
    rawApprove = yield call(keyService.callSignTransaction, "getApproveToken", isPayMode, ethereum, sourceToken,
      sourceAmount, nonce, gas, gasPrice, keystring, password, accountType, account.address, networkId, isApproveZero)
  } catch (e) {
    let msg = ''

    if (isLedgerError(accountType, e)) {
      msg = keyService.getLedgerError(e)
    } else {
      msg = e.message
    }

    yield put(actions.setSignError(msg))

    return
  }

  try {
    const hashApprove = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", rawApprove)

    yield put(actions.setApproveTx(hashApprove, sourceTokenSymbol));
    yield put(incManualNonceAccount(account.address));
    yield put(actions.fetchGasSuccess());
    yield put(actions.unsetConfirming());

    yield call(setApproveState, isApproveZero);
  } catch (e) {
    yield call(doTxFail, ethereum, account, e.message)
  }
}

export function* processApproveByMetamask(action) {
  const { ethereum, sourceToken, sourceAmount, nonce, gas, gasPrice, keystring,
    password, accountType, account, keyService, sourceTokenSymbol, isApproveZero } = action.payload;

  var networkId = common.getNetworkId()
  const isPayMode = checkIsPayMode();

  try {
    const hashApprove = yield call(keyService.callSignTransaction, "getApproveToken", isPayMode, ethereum, sourceToken,
      sourceAmount, nonce, gas, gasPrice, keystring, password, accountType, account.address, networkId, isApproveZero);

    yield put(actions.setApproveTx(hashApprove, sourceTokenSymbol));
    yield put(incManualNonceAccount(account.address));
    yield put(actions.fetchGasSuccess());
    yield put(actions.unsetConfirming());

    yield call(setApproveState, isApproveZero);
  } catch (e) {
    yield put(actions.setSignError(e))
  }
}

export function* doBeforeMakeTransaction(txRaw) {
  yield put(actions.goToStep(4))

  var state = store.getState()
  var ethereum = state.connection.ethereum
  yield call([ethereum, ethereum.call], "getTxHash", txRaw)

  return true
}

export function* exchangeETHtoTokenKeystore(action) {
  const {
    formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
    nonce, gas, gasPrice, keystring, type, password, account, data, keyService, balanceData,
    blockNo, paymentData, hint } = action.payload;

  var networkId = common.getNetworkId()
  var txRaw;

  try {
    txRaw = yield callService(
      "etherToOthersFromAccount", "etherToOthersPayment",
      keyService, formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount,
      minConversionRate, blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, paymentData, hint
    )
  } catch (e) {
    console.log(e)
    yield put(actions.throwPassphraseError(e.message))
    return
  }
  try {
    yield put(actions.prePareBroadcast(balanceData))

    var response = yield call(doBeforeMakeTransaction, txRaw)
    console.log(response)

    var hash = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", txRaw)
    yield call(runAfterBroadcastTx, ethereum, txRaw, hash, account, data)
  } catch (e) {
    console.log(e)
    yield call(doTxFail, ethereum, account, e.message)
    return
  }
}

export function* exchangeETHtoTokenPrivateKey(action) {
  const {
    formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
    nonce, gas, gasPrice, keystring, type, password, account, data, keyService, balanceData,
    blockNo, paymentData, hint } = action.payload;

  var networkId = common.getNetworkId()

  try {
    var txRaw
    try {
      txRaw = yield callService(
        "etherToOthersFromAccount", "etherToOthersPayment",
        keyService, formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount,
        minConversionRate, blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, paymentData, hint
      )
    } catch (e) {
      console.log(e)
      yield put(actions.setSignError(e.message))
      return
    }

    yield put(actions.prePareBroadcast(balanceData))

    var response = yield call(doBeforeMakeTransaction, txRaw)
    console.log(response)

    const hash = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", txRaw)
    yield call(runAfterBroadcastTx, ethereum, txRaw, hash, account, data)
  } catch (e) {
    console.log(e)
    yield call(doTxFail, ethereum, account, e.message)
    return
  }
}

export function* exchangeETHtoTokenColdWallet(action) {
  const {
    formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
    nonce, gas, gasPrice, keystring, type, password, account, data, keyService, balanceData,
    blockNo, paymentData, hint } = action.payload;

  var networkId = common.getNetworkId()

  try {
    var txRaw
    try {
      txRaw = yield callService(
        "etherToOthersFromAccount", "etherToOthersPayment",
        keyService, formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount,
        minConversionRate, blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, paymentData, hint
      )
    } catch (e) {
      console.log(e)
      let msg = ''
      if (isLedgerError(type, e)) {
        msg = keyService.getLedgerError(e)
      } else {
        msg = e.message
      }
      yield put(actions.setSignError(msg))
      return
    }
    yield put(actions.prePareBroadcast(balanceData))

    var response = yield call(doBeforeMakeTransaction, txRaw)
    console.log(response)

    const hash = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", txRaw)
    yield call(runAfterBroadcastTx, ethereum, txRaw, hash, account, data)
  } catch (e) {
    console.log(e)
    yield call(doTxFail, ethereum, account, e.message)
    return
  }
}

function* exchangeETHtoTokenMetamask(action) {
  const {
    formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
    nonce, gas, gasPrice, keystring, type, password, account, data, keyService, balanceData,
    blockNo, paymentData, hint } = action.payload

  var networkId = common.getNetworkId()

  try {
    var hash
    try {
      hash = yield callService(
        "etherToOthersFromAccount", "etherToOthersPayment",
        keyService, formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount,
        minConversionRate, blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, paymentData, hint
      )
    } catch (e) {
      yield put(actions.setSignError(e))
      return
    }

    yield put(actions.prePareBroadcast(balanceData))
    const txRaw = { gas, gasPrice, nonce }
    yield call(runAfterBroadcastTx, ethereum, txRaw, hash, account, data)
  } catch (e) {
    yield call(doTxFail, ethereum, account, e.message)
    return
  }
}

function* exchangeTokentoETHKeystore(action) {
  let {
    formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
    nonce, gas, gasPrice, keystring, type, password, account, data, keyService, balanceData,
    sourceTokenSymbol, blockNo, paymentData, hint } = action.payload;

  const networkId = common.getNetworkId();
  const isPayMode = checkIsPayMode();
  const remainStr = yield call([ethereum, ethereum.call], "getAllowanceAtLatestBlock", sourceToken, address, isPayMode);
  const remain = converter.hexToBigNumber(remainStr);
  const sourceAmountBig = converter.hexToBigNumber(sourceAmount);
  let rawApprove, rawApproveZero;

  if (!remain.isGreaterThanOrEqualTo(sourceAmountBig)) {
    if (remain != 0) {
      try {
        rawApproveZero = yield call(keyService.callSignTransaction, "getApproveToken", isPayMode, ethereum, sourceToken,
          sourceAmount, nonce, gas, gasPrice, keystring, password, type, address, networkId, true);
      } catch (e) {
        yield put(actions.throwPassphraseError(e.message));
        return;
      }

      try {
        yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", rawApproveZero);
        yield put(incManualNonceAccount(account.address));
        nonce++;
      } catch (e) {
        yield call(doTxFail, ethereum, account, e.message);
        return;
      }
    }

    try {
      rawApprove = yield call(keyService.callSignTransaction, "getApproveToken", isPayMode, ethereum, sourceToken,
        sourceAmount, nonce, gas, gasPrice, keystring, password, type, address, networkId)
    } catch (e) {
      yield put(actions.throwPassphraseError(e.message))
      return
    }

    try {
      yield put(actions.prePareBroadcast(balanceData))
      var txRaw
      try {
        var hashApprove = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", rawApprove);

        yield put(actions.setApproveTx(hashApprove, sourceTokenSymbol))
        yield put(incManualNonceAccount(account.address))
        nonce++;

        txRaw = yield callService(
          "tokenToOthersFromAccount", "tokenToOthersPayment",
          keyService, formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount,
          minConversionRate, blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, paymentData, hint
        );
      } catch (e) {
        yield call(doTxFail, ethereum, account, e.message);
        return;
      }

      yield call(doBeforeMakeTransaction, txRaw);
      yield put(actions.prePareBroadcast(balanceData));

      var hash = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", txRaw)
      yield call(runAfterBroadcastTx, ethereum, txRaw, hash, account, data)
    } catch (e) {
      yield call(doTxFail, ethereum, account, e.message)
      return
    }
  } else {
    var txRaw

    try {
      txRaw = yield callService(
        "tokenToOthersFromAccount", "tokenToOthersPayment",
        keyService, formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount,
        minConversionRate, blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, paymentData, hint
      );
    } catch (e) {
      yield put(actions.throwPassphraseError(e.message))
      return
    }

    try {
      yield put(actions.prePareBroadcast(balanceData))
      yield call(doBeforeMakeTransaction, txRaw)

      const hash = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", txRaw)

      yield call(runAfterBroadcastTx, ethereum, txRaw, hash, account, data)
    } catch (e) {
      yield call(doTxFail, ethereum, account, e.message)
      return
    }
  }
}

export function* exchangeTokentoETHPrivateKey(action) {
  let {
    formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
    nonce, gas, gasPrice, keystring, type, password, account, data, keyService, balanceData,
    sourceTokenSymbol, blockNo, paymentData, hint } = action.payload;

  const networkId = common.getNetworkId();
  const isPayMode = checkIsPayMode();
  const remainStr = yield call([ethereum, ethereum.call], "getAllowanceAtLatestBlock", sourceToken, address, isPayMode);
  const remain = converter.hexToBigNumber(remainStr);
  const sourceAmountBig = converter.hexToBigNumber(sourceAmount);
  let txRaw, rawApprove, rawApproveZero;

  try {
    if (!remain.isGreaterThanOrEqualTo(sourceAmountBig)) {
      if (remain != 0) {
        try {
          rawApproveZero = yield call(keyService.callSignTransaction, "getApproveToken", isPayMode, ethereum, sourceToken,
            sourceAmount, nonce, gas, gasPrice, keystring, password, type, address, networkId, true);
        } catch (e) {
          yield put(actions.setSignError(e.message));
          return;
        }

        try {
          yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", rawApproveZero);
          yield put(incManualNonceAccount(account.address));
          nonce++;
        } catch (e) {
          yield call(doTxFail, ethereum, account, e.message);
          return;
        }
      }

      try {
        rawApprove = yield call(keyService.callSignTransaction, "getApproveToken", isPayMode, ethereum, sourceToken,
          sourceAmount, nonce, gas, gasPrice, keystring, password, type, address, networkId)
      } catch (e) {
        yield put(actions.setSignError(e.message))
        return
      }

      yield put(actions.prePareBroadcast(balanceData))

      try {
        var hashApprove = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", rawApprove)
        yield put(actions.setApproveTx(hashApprove, sourceTokenSymbol))
        yield put(incManualNonceAccount(account.address))
        nonce++
      } catch (e) {
        yield call(doTxFail, ethereum, account, e.message)
        return
      }
    }

    try {
      txRaw = yield callService(
        "tokenToOthersFromAccount", "tokenToOthersPayment",
        keyService, formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount,
        minConversionRate, blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, paymentData, hint
      );
    } catch (e) {
      yield put(actions.setSignError(e.message))
      return
    }

    yield call(doBeforeMakeTransaction, txRaw);
    yield put(actions.prePareBroadcast(balanceData));

    var hash = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", txRaw)
    yield call(runAfterBroadcastTx, ethereum, txRaw, hash, account, data)
  } catch (e) {
    yield call(doTxFail, ethereum, account, e.message)
  }
}

function* exchangeTokentoETHColdWallet(action) {
  const {
    formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
    nonce, gas, gasPrice, keystring, type, password, account, data, keyService, balanceData,
    blockNo, paymentData, hint } = action.payload;

  var networkId = common.getNetworkId()

  try {
    let txRaw

    try {
      txRaw = yield callService(
        "tokenToOthersFromAccount", "tokenToOthersPayment",
        keyService, formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount,
        minConversionRate, blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, paymentData, hint
      );
    } catch (e) {
      console.log(e)
      let msg = ''
      if (isLedgerError(type, e)) {
        msg = keyService.getLedgerError(e)
      } else {
        msg = e.message
      }
      yield put(actions.setSignError(msg))
      return
    }

    yield put(actions.prePareBroadcast(balanceData))

    var response = yield call(doBeforeMakeTransaction, txRaw)
    console.log(response)

    const hash = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", txRaw)
    yield call(runAfterBroadcastTx, ethereum, txRaw, hash, account, data)
  } catch (e) {
    yield call(doTxFail, ethereum, account, e.message)
    return
  }
}

export function* exchangeTokentoETHMetamask(action) {
  const {
    formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
    nonce, gas, gasPrice, keystring, type, password, account, data, keyService, balanceData,
    blockNo, paymentData, hint } = action.payload

  var networkId = common.getNetworkId()

  try {
    var hash

    try {
      hash = yield callService(
        "tokenToOthersFromAccount", "tokenToOthersPayment",
        keyService, formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount,
        minConversionRate, blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, paymentData, hint
      );
    } catch (e) {
      yield put(actions.setSignError(e))
      return
    }

    yield put(actions.prePareBroadcast(balanceData))
    const txRaw = { gas, gasPrice, nonce }
    yield call(runAfterBroadcastTx, ethereum, txRaw, hash, account, data)
  } catch (e) {
    console.log(e)
    yield call(doTxFail, ethereum, account, e.message)
    return
  }
}

function* callService(
  swapMethod, paymentMethod, keyService, formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress,
  maxDestAmount, minConversionRate, blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, paymentData, hint
) {
  let toContract;

  if (checkIsPayMode()) {
    toContract = common.getPayWrapperAddress();

    return yield call(
      keyService.callSignTransaction, paymentMethod, formId, ethereum, address,
      sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
      blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, toContract, paymentData, hint
    )
  } else {
    toContract = common.getKyberAddress();

    return yield call(keyService.callSignTransaction, swapMethod, formId, ethereum, address,
      sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
      blockNo, nonce, gas, gasPrice, keystring, type, password, networkId, toContract
    )
  }
}

function* getRate(ethereum, source, dest, sourceAmount) {
  try {
    //get latestblock
    const lastestBlock = yield call([ethereum, ethereum.call], "getLatestBlock")
    const rate = yield call(handleGetRate, ethereum, source, dest, sourceAmount, lastestBlock)
    const expectedPrice = rate.expectedPrice ? rate.expectedPrice : "0"
    const slippagePrice = rate.slippagePrice ? rate.slippagePrice : "0"
    return { status: "success", res: { expectedPrice, slippagePrice, lastestBlock } }
  }
  catch (err) {
    console.log(err)
    return { status: "fail" }
  }
}

function* getSourceAmount(sourceTokenSymbol, sourceAmount) {
  var state = store.getState()
  var tokens = state.tokens.tokens

  var sourceAmountHex = "0x0"
  if (tokens[sourceTokenSymbol]) {
    var decimals = tokens[sourceTokenSymbol].decimals
    var rateSell = tokens[sourceTokenSymbol].rate
    sourceAmountHex = converter.calculateMinSource(sourceTokenSymbol, sourceAmount, decimals, rateSell)
  } else {
    sourceAmountHex = converter.stringToHex(sourceAmount, 18)
  }
  return sourceAmountHex
}

function* getSourceAmountZero(sourceTokenSymbol) {
  var state = store.getState()
  var tokens = state.tokens.tokens
  var sourceAmountHex = "0x0"
  if (tokens[sourceTokenSymbol]) {
    var decimals = tokens[sourceTokenSymbol].decimals
    var rateSell = tokens[sourceTokenSymbol].rate
    sourceAmountHex = converter.toHex(converter.getSourceAmountZero(sourceTokenSymbol, decimals, rateSell))
  }
  return sourceAmountHex
}

function* handleGetRate(ethereum, source, dest, sourceAmountRefined, latestBlock) {
  let rate;
  try {
    rate = yield call([ethereum, ethereum.call], "getRateAtSpecificBlock", source, dest, sourceAmountRefined, latestBlock);
  } catch (e) {
    rate = {
      expectedPrice: 0,
      slippagePrice: 0
    };
  }

  return rate;
}

function* validateExpectedPriceAndSetFluctuatingRate(expectedPrice, ethereum, source, dest, sourceAmountRefined, sourceAmountZero) {
  try {
    const latestBlock = yield call([ethereum, ethereum.call], "getLatestBlock")
    const rate = yield call(handleGetRate, ethereum, source, dest, sourceAmountRefined, latestBlock);
    const rateZero = yield call(handleGetRate, ethereum, source, dest, sourceAmountZero, latestBlock);
    let fluctuatingRate = 0;

    if (+rateZero.expectedPrice && +rate.expectedPrice) {
      fluctuatingRate = (rateZero.expectedPrice - rate.expectedPrice) / rateZero.expectedPrice;
      fluctuatingRate = Math.round(fluctuatingRate * 1000) / 10;
      if (fluctuatingRate <= 0.1) fluctuatingRate = 0;

      if (fluctuatingRate == 100) {
        fluctuatingRate = 0;
        expectedPrice = "0";
      }
    }

    yield put(actions.setFluctuatingRate(fluctuatingRate));

    return expectedPrice;
  } catch (e) {
    console.log(e);
  }
}

function* updateRatePending(action) {
  let { source, dest, sourceAmount, sourceTokenSymbol, isManual } = action.payload
  const state = store.getState();
  const exchange = state.exchange;
  const destTokenSymbol = state.exchange.destTokenSymbol;
  const ethereum = state.connection.ethereum
  const translate = getTranslate(state.locale)

  if (sourceAmount === false) {
    const calculatedSourceAmountRate = yield call([ethereum, ethereum.call], "calculateSourceAmountFromDestToken", sourceTokenSymbol, exchange.destTokenSymbol, exchange.destAmount);
    sourceAmount = calculatedSourceAmountRate.value;
  }

  var sourceAmoutRefined = yield call(getSourceAmount, sourceTokenSymbol, sourceAmount)
  var sourceAmoutZero = yield call(getSourceAmountZero, sourceTokenSymbol)
  const errors = {
    getRate: translate("error.get_rate") || "Cannot get rate from Blockchain",
    kyberMaintain: translate("error.kyber_maintain") || "This pair is temporarily under maintenance",
    handleAmount: translate("error.handle_amount") || "Kyber cannot handle your amount, please reduce amount",
  };

  if (isManual) {
    var rateRequest = yield call(common.handleRequest, getRate, ethereum, source, dest, sourceAmoutRefined)
    if (rateRequest.status === "success") {
      var { expectedPrice, slippagePrice, lastestBlock } = rateRequest.data
      var rateInit = expectedPrice.toString()
      if (expectedPrice.toString() === "0") {
        var rateRequestZeroAmount = yield call(common.handleRequest, getRate, ethereum, source, dest, sourceAmoutZero)

        if (rateRequestZeroAmount.status === "success") {
          rateInit = rateRequestZeroAmount.data.expectedPrice
        }
        if (rateRequestZeroAmount.status === "timeout") {
          yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
            translate("error.node_error") || "There are some problems with nodes. Please try again in a while."))
          return
        }
        if (rateRequestZeroAmount.status === "fail") {
          yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
            translate("error.network_error") || "Cannot connect to node right now. Please check your network!"))
          return
        }
      }

      expectedPrice = yield call(validateExpectedPriceAndSetFluctuatingRate, expectedPrice, ethereum, source, dest, sourceAmoutRefined, sourceAmoutZero);
      yield put.resolve(actions.updateRateExchangeComplete(rateInit, expectedPrice, slippagePrice, lastestBlock, isManual, true, errors))
      yield call(estimateGasUsed, sourceTokenSymbol, destTokenSymbol);
    }

    if (rateRequest.status === "timeout") {
      yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
        translate("error.node_error") || "There are some problems with nodes. Please try again in a while."))
    }
    if (rateRequest.status === "fail") {
      yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
        translate("error.network_error") || "Cannot connect to node right now. Please check your network!"))
    }
  } else {
    const rateRequest = yield call(getRate, ethereum, source, dest, sourceAmoutRefined)
    if (rateRequest.status === "success") {
      var { expectedPrice, slippagePrice, lastestBlock } = rateRequest.res
      var rateInit = expectedPrice.toString()
      if (expectedPrice.toString() === "0") {
        var rateRequestZeroAmount = yield call(common.handleRequest, getRate, ethereum, source, dest, sourceAmoutZero)

        if (rateRequestZeroAmount.status === "success") {
          rateInit = rateRequestZeroAmount.data.expectedPrice
        }
        if (rateRequestZeroAmount.status === "timeout") {
          yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
            translate("error.node_error") || "There are some problems with nodes. Please try again in a while."))
          return
        }
        if (rateRequestZeroAmount.status === "fail") {
          yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
            translate("error.network_error") || "Cannot connect to node right now. Please check your network!"))
          return
        }
      }

      expectedPrice = yield call(validateExpectedPriceAndSetFluctuatingRate, expectedPrice, ethereum, source, dest, sourceAmoutRefined, sourceAmoutZero);
      yield put.resolve(actions.updateRateExchangeComplete(rateInit, expectedPrice, slippagePrice, lastestBlock, isManual, true, errors))
      yield call(estimateGasUsed, sourceTokenSymbol, destTokenSymbol);
    }
  }

  yield put(actions.setSrcAmountLoading(false));
  yield put(actions.setDestAmountLoading(false));
}

function* getRateSnapshot(ethereum, source, dest, sourceAmountHex) {
  try {
    var rate = yield call([ethereum, ethereum.call], "getRate", source, dest, sourceAmountHex)
    return { status: "success", res: rate }
  } catch (e) {
    console.log(e)
    return { status: "fail", err: e }
  }
}

function* updateRateSnapshot(action) {
  const ethereum = action.payload
  var state = store.getState()
  var exchangeSnapshot = state.exchange.snapshot
  var translate = getTranslate(state.locale)
  try {
    var source = exchangeSnapshot.sourceToken
    var dest = exchangeSnapshot.destToken
    var sourceAmount

    if (exchangeSnapshot.isHaveDestAmount) {
      sourceAmount = converter.caculateSourceAmount(exchangeSnapshot.destAmount, exchangeSnapshot.offeredRate, 6)
    } else {
      sourceAmount = exchangeSnapshot.sourceAmount
    }

    var sourceDecimal = exchangeSnapshot.sourceDecimal
    var sourceAmountHex = converter.stringToHex(sourceAmount, sourceDecimal)
    var rateInit = 0
    var rateRequest = yield call(common.handleRequest, getRateSnapshot, ethereum, source, dest, sourceAmountHex)

    if (rateRequest.status === "success") {
      var rate = rateRequest.data
      var expectedPrice = rate.expectedRate ? rate.expectedRate : "0"
      var slippagePrice = rate.slippageRate ? rate.slippageRate : "0"
      if (source !== dest && expectedPrice == 0) {
        yield put(utilActions.openInfoModal(translate("error.error_occurred") || "Error occurred",
          translate("error.node_error") || "There are some problems with nodes. Please try again in a while."))
        yield put(actions.hideApprove())
        yield put(actions.hideConfirm())
        yield put(actions.hidePassphrase())
      } else {
        yield put.resolve(actions.updateRateSnapshotComplete(rateInit, expectedPrice, slippagePrice))
        yield put(actions.caculateAmountInSnapshot())
      }
    } else {
      yield put(actions.hideApprove())
      yield put(actions.hideConfirm())
      yield put(actions.hidePassphrase())
    }
    var title = translate("error.error_occurred") || "Error occurred"
    var content = ''
    if (rateRequest.status === "timeout") {
      content = translate("error.node_error") || "There are some problems with nodes. Please try again in a while."
      yield put(utilActions.openInfoModal(title, content))
    }
    if (rateRequest.status === "fail") {
      content = translate("error.network_error") || "Cannot connect to node right now. Please check your network!"
      yield put(utilActions.openInfoModal(title, content))
    }
  }
  catch (err) {
    console.log("===================")
    console.log(err)
  }
}

function* fetchGasConfirmSnapshot() {
  var gas
  var gas_approve = 0

  var gasRequest = yield call(common.handleRequest, getGasConfirm)
  if (gasRequest.status === "success") {
    const gas = gasRequest.data
    yield put(actions.setEstimateGasSnapshot(gas, gas_approve))
  }
  if ((gasRequest.status === "timeout") || (gasRequest.status === "fail")) {
    gas = yield call(getMaxGasExchange)
    yield put(actions.setEstimateGasSnapshot(gas, gas_approve))
  }

  yield put(actions.fetchGasSuccessSnapshot())
}

function* fetchGasApproveSnapshot() {
  var gas = yield call(getMaxGasExchange)
  var gas_approve

  var gasRequest = yield call(common.handleRequest, getGasApprove)
  if (gasRequest.status === "success") {
    const gas_approve = gasRequest.data
    yield put(actions.setEstimateGasSnapshot(gas, gas_approve))
  }
  if ((gasRequest.status === "timeout") || (gasRequest.status === "fail")) {
    console.log("timeout")

    gas_approve = yield call(getMaxGasApprove)
    yield put(actions.setEstimateGasSnapshot(gas, gas_approve))
  }

  yield put(actions.fetchGasSuccessSnapshot())
}

function* getMaxGasExchange(srcSymbol, destSymbol) {
  const state = store.getState();
  const srcTokenAddress = state.exchange.sourceToken;
  const destTokenAddress = state.exchange.destToken;
  const ethereum = state.connection.ethereum;
  let srcAmount = state.exchange.sourceAmount;

  if (!srcAmount && state.exchange.type === 'pay' && state.exchange.destAmount && state.exchange.offeredRate) {
    srcAmount = converter.caculateSourceAmount(state.exchange.destAmount, state.exchange.offeredRate, 6);
  }

  try {
    const gasLimitResult =  yield call([ethereum, ethereum.call], "getGasLimit", srcTokenAddress, destTokenAddress, srcAmount);

    if (gasLimitResult.error) {
      return yield call(getMaxGasExchangeFromTokens, srcSymbol, destSymbol);
    }
    
    if (state.exchange.type === 'pay') {
      return Math.round((gasLimitResult.data * 1.2) + 100000);
    } else {
      return gasLimitResult.data;
    }
  } catch (err) {
    console.log(err);
    return yield call(getMaxGasExchangeFromTokens, srcSymbol, destSymbol);
  }
}

function* getMaxGasExchangeFromTokens(srcSymbol, destSymbol) {
  const state = store.getState()
  const exchange = state.exchange
  const tokens = state.tokens.tokens
  const sourceTokenLimit = tokens[srcSymbol].gasLimit
  const destTokenLimit = tokens[destSymbol].gasLimit
  const sourceGasLimit = sourceTokenLimit || sourceTokenLimit === 0 ? parseInt(sourceTokenLimit) : exchange.max_gas
  const destGasLimit = destTokenLimit || destTokenLimit === 0 ? parseInt(destTokenLimit) : exchange.max_gas

  return sourceGasLimit + destGasLimit
}

function* getMaxGasApprove(tokenGasApprove) {  
  return tokenGasApprove ? tokenGasApprove : 100000;
}

function* getGasConfirm() {
  var state = store.getState()
  const ethereum = state.connection.ethereum
  const exchange = state.exchange
  const kyber_address = BLOCKCHAIN_INFO.network
  const maxGas = yield call(getMaxGasExchange)
  var account = state.account.account
  var address = account.address
  var tokens = state.tokens.tokens
  var sourceDecimal = 18
  var sourceTokenSymbol = exchange.sourceTokenSymbol

  if (tokens[sourceTokenSymbol]) {
    sourceDecimal = tokens[sourceTokenSymbol].decimals
  }

  const sourceToken = exchange.sourceToken
  const sourceAmount = converter.stringToHex(exchange.sourceAmount, sourceDecimal)
  const destToken = exchange.destToken
  const maxDestAmount = converter.biggestNumber()
  const minConversionRate = converter.numberToHex(converter.toTWei(exchange.slippageRate, 18))
  const blockNo = converter.numberToHexAddress(exchange.blockNo)
  const paymentData = exchange.paymentData;
  const hint = exchange.hint;
  var data

  if (checkIsPayMode()) {
    data = yield call([ethereum, ethereum.call], "getPaymentEncodedData", sourceToken, sourceAmount,
      destToken, address, maxDestAmount, minConversionRate, blockNo, paymentData, hint)
  } else {
    data = yield call([ethereum, ethereum.call], "exchangeData", sourceToken, sourceAmount,
      destToken, address, maxDestAmount, minConversionRate, blockNo)
  }

  var gas = 0

  var value = '0x0'
  if (exchange.sourceTokenSymbol === 'ETH') {
    value = sourceAmount
  }

  var txObj = {
    from: address,
    to: kyber_address,
    data: data,
    value: value
  }

  try {
    gas = yield call([ethereum, ethereum.call], "estimateGas", txObj)
    gas = Math.round(gas * 120 / 100)
    if (gas > maxGas) {
      gas = maxGas
    }
    return { status: "success", res: gas }
  } catch (e) {
    console.log(e)
    return { status: "fail", err: e }
  }
}

function* getGasApprove() {
  var state = store.getState()
  const ethereum = state.connection.ethereum
  const exchange = state.exchange
  const sourceToken = exchange.sourceToken

  var account = state.account.account
  var address = account.address

  const maxGasApprove = yield call(getMaxGasApprove)
  var gas_approve = 0
  const isPayMode = checkIsPayMode();

  try {
    var dataApprove = yield call([ethereum, ethereum.call], "approveTokenData", sourceToken, converter.biggestNumber(), isPayMode)
    var txObjApprove = {
      from: address,
      to: sourceToken,
      data: dataApprove,
      value: '0x0',
    }
    gas_approve = yield call([ethereum, ethereum.call], "estimateGas", txObjApprove)
    gas_approve = Math.round(gas_approve * 120 / 100)
    if (gas_approve > maxGasApprove) {
      gas_approve = maxGasApprove
    }
    return { status: "success", res: gas_approve }
  } catch (e) {
    console.log(e)
    return { status: "fail", err: e }
  }
}

function* checkKyberEnable() {
  var state = store.getState()
  const ethereum = state.connection.ethereum
  try {
    var enabled = yield call([ethereum, ethereum.call], "checkKyberEnable")
    yield put(actions.setKyberEnable(enabled))
  } catch (e) {
    console.log(e.message)
    yield put(actions.setKyberEnable(false))
  }

}

function* verifyExchange() {
  var state = store.getState()
  const exchange = state.exchange
  const tokens = state.tokens.tokens
  const translate = getTranslate(state.locale)
  var srcAmount
  var sourceTokenSymbol = exchange.sourceTokenSymbol

  if (sourceTokenSymbol !== "ETH") {
    if (tokens[sourceTokenSymbol].rate == 0) {
      yield put(actions.throwErrorExchange("src_small", ""))
      return
    }
  }

  if (exchange.isHaveDestAmount) {
    var offeredRate = exchange.offeredRate
    srcAmount = converter.caculateSourceAmount(exchange.destAmount, offeredRate, 6)
    srcAmount = converter.toTWei(srcAmount, tokens[sourceTokenSymbol].decimals)
  } else {
    srcAmount = exchange.sourceAmount
    srcAmount = converter.toTWei(srcAmount, tokens[sourceTokenSymbol].decimals)
  }

  if (sourceTokenSymbol !== "ETH") {
    var rate = tokens[sourceTokenSymbol].rate
    var decimals = tokens[sourceTokenSymbol].decimals
    srcAmount = converter.toT(srcAmount, decimals)
    srcAmount = converter.caculateDestAmount(srcAmount, rate, 6)
    srcAmount = converter.toTWei(srcAmount, 18)
  }

  if (converter.compareTwoNumber(srcAmount, constansts.EPSILON) === -1) {
    var minAmount = converter.toEther(constansts.EPSILON)
    yield put(actions.throwErrorExchange("src_small", translate("error.source_amount_too_small", { minAmount: minAmount }) || `Source amount is too small. Minimum amount is ${minAmount} ETH equivalent.`))
  } else {
    yield put(actions.throwErrorExchange("src_small", ""))
  }
}

export function* initParamsExchange(action) {
  var state = store.getState()
  var exchange = state.exchange
  var sourceTokenSymbol = exchange.sourceTokenSymbol
  var source = exchange.sourceToken

  const { receiveToken, tokenAddr, receiveAmount, network, type, defaultPairArr, tokens } = action.payload

  var ethereum = new EthereumService({ network })


  if (type === 'swap' && defaultPairArr.length === 2){
    sourceTokenSymbol = defaultPairArr[0]
    source = tokens[sourceTokenSymbol].address
    var destSymbol = defaultPairArr[1]
    var destAddress = tokens[destSymbol].address
    yield put.resolve(actions.changeDefaultTokens(sourceTokenSymbol, source, destSymbol, destAddress))
  }

  yield put.resolve(setConnection(ethereum))

  if (type === 'buy') {
    if (receiveToken === 'ETH') {
      sourceTokenSymbol = 'KNC'
      source = tokens['KNC'].address
      yield put.resolve(actions.updateSourceToken(sourceTokenSymbol, source))
    }
  }

  yield call(estimateGasUsed, sourceTokenSymbol, receiveToken)
  var dest = tokenAddr

  if (receiveAmount) {
    const isSameToken = sourceTokenSymbol === receiveToken;

    try {
      if (type !== 'pay' && !isSameToken) {
        if (receiveToken === "ETH") {
          if (parseFloat(receiveAmount) > constants.MAX_AMOUNT_RATE_HANDLE) {
            yield put(actions.throwErrorHandleAmount())
            return
          }
        } else {
          var rateETH = yield call([ethereum, ethereum.call], "getRate", tokens["ETH"].address, tokenAddr, "0x0")
          var destValue = converter.caculateSourceAmount(receiveAmount, rateETH.expectedRate, 6)
          if (parseFloat(destValue) > constants.MAX_AMOUNT_RATE_HANDLE) {
            yield put(actions.throwErrorHandleAmount())
            return
          }
        }
      }

      if (!isSameToken) {
        yield put(actions.updateRateExchange(source, dest, false, sourceTokenSymbol, true))
      }
    } catch (e) {
      yield put(actions.updateRateExchange(source, dest, false, sourceTokenSymbol, true))
    }
  } else {
    yield put(actions.updateRateExchange(source, dest, 0, sourceTokenSymbol, true))
  }

  ethereum.subcribe()


  const web3Service = web3Package.newWeb3Instance()
  if(web3Service !== false){
    const watchMetamask = yield fork(watchMetamaskAccount, ethereum, web3Service, network)
    yield take('GLOBAL.INIT_SESSION')
    yield cancel(watchMetamask)
  }else{
    yield put(globalActions.throwErrorMematamask("Metamask is not installed"))
  }

  var notiService = new NotiService({ type: "session" })
  yield put(globalActions.setNotiHandler(notiService))
}


function* watchMetamaskAccount(ethereum, web3Service, network) {
  var translate = getTranslate(store.getState().locale)
  while (true) {
    try {
      var state = store.getState()
      if (!commonFunc.checkComponentExist(state.global.params.appId)) {
        return
      }
      const account = state.account.account
      if (account === false) {
        const currentId = yield call([web3Service, web3Service.getNetworkId])
        const networkId = BLOCKCHAIN_INFO[network].networkId
        if (parseInt(currentId, 10) !== networkId) {
          const currentName = commonFunc.findNetworkName(parseInt(currentId, 10))
          const expectedName = commonFunc.findNetworkName(networkId)
          yield put(globalActions.throwErrorMematamask(translate("error.network_not_match", { expectedName: expectedName, currentName: currentName }) || `Metamask should be on ${expectedName}. Currently on ${currentName}`))
          return
        }

        try {
          const coinbase = yield call([web3Service, web3Service.getCoinbase])
          const balanceBig = yield call([ethereum, ethereum.call], "getBalanceAtLatestBlock", coinbase)
          const balance = converter.roundingNumber(converter.toEther(balanceBig))
          yield put(globalActions.updateMetamaskAccount(coinbase, balance))
        } catch (e) {
          console.log(e)
          yield put(globalActions.throwErrorMematamask(translate("error.cannot_connect_metamask") || `Cannot get metamask account. You probably did not login in Metamask`))
        }
      }
    } catch (e) {
      console.log(e)
      yield put(globalActions.throwErrorMematamask(e.message))
    }

    yield call(delay, 5000)
  }
}

function isLedgerError(accountType, error) {
  return accountType === "ledger" && error.hasOwnProperty("statusCode");
}

function checkIsPayMode() {
  const state = store.getState();

  return !state.exchange.isSwap;
}

function *setApproveState(isApproveZero) {
  if (isApproveZero) {
    yield put(actions.setIsApproveZero(false));
    yield put(actions.setApprove(true));
  } else {
    yield put(actions.setApprove(false));
  }
}

export function* watchExchange() {
  yield takeEvery("EXCHANGE.APPROVAL_TX_BROADCAST_PENDING", approveTx)
  yield takeEvery("EXCHANGE.PROCESS_EXCHANGE", processExchange)
  yield takeEvery("EXCHANGE.PROCESS_APPROVE", processApprove)
  yield takeEvery("EXCHANGE.CHECK_TOKEN_BALANCE_COLD_WALLET", checkTokenBalanceOfColdWallet)
  yield takeEvery("EXCHANGE.UPDATE_RATE_PENDING", updateRatePending)
  yield takeEvery("EXCHANGE.UPDATE_RATE_SNAPSHOT", updateRateSnapshot)
  yield takeEvery("EXCHANGE.ESTIMATE_GAS_USED", estimateGasUsed)
  yield takeEvery("EXCHANGE.SELECT_TOKEN_ASYNC", selectToken)
  yield takeEvery("EXCHANGE.CHECK_KYBER_ENABLE", checkKyberEnable)
  yield takeEvery("EXCHANGE.VERIFY_EXCHANGE", verifyExchange)
  yield takeEvery("EXCHANGE.INIT_PARAMS_EXCHANGE", initParamsExchange)
  yield takeEvery("EXCHANGE.SWAP_TOKEN", swapToken)
  yield takeEvery("EXCHANGE.INPUT_CHANGE", changeInputValue)
}
