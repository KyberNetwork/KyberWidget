import { put, call, fork, takeEvery } from 'redux-saga/effects'
import * as actions from '../actions/transferActions'
import * as exchangeActions from '../actions/exchangeActions'
import constants from "../services/constants"
import * as converter from "../utils/converter"
import * as ethUtil from 'ethereumjs-util'
import * as common from "./common"
import * as validators from "../utils/validators"
import Tx from "../services/tx"
import { updateAccount, incManualNonceAccount } from '../actions/accountActions'
import { addTx } from '../actions/txActions'
import { store } from "../store"
import { getTranslate } from "react-localize-redux/lib/index";
import BLOCKCHAIN_INFO from "../../../env";
import * as widgetOptions from "../utils/widget-options";

export function* runAfterBroadcastTx(ethereum, txRaw, hash, account, data) {

  if (account.type === 'metamask') {
    yield put(exchangeActions.goToStep(4))
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
    ethUtil.bufferToInt(txRaw.nonce), "pending", "transfer", data)
  yield put(incManualNonceAccount(account.address))
  yield put(updateAccount(ethereum, account))
  yield put(addTx(tx))
  yield put(exchangeActions.doTransactionComplete(hash))
  yield put(exchangeActions.finishExchange())
  yield put(exchangeActions.resetSignError())
  widgetOptions.postMessageBroadCasted(tx.hash);
}

function* doTxFail(ethereum, account, e) {
  var state = store.getState()
  var exchange = state.exchange

  yield put(exchangeActions.goToStep(4))

  let error = e;
  if (!error) {
    var translate = getTranslate(store.getState().locale);
    var link = BLOCKCHAIN_INFO[exchange.network].ethScanUrl + "address/" + account.address;
    error = translate("error.broadcast_tx", { link: link }) || "Potentially Failed! We likely couldn't broadcast the transaction to the blockchain. Please check on Etherscan to verify."
  }

  yield put(exchangeActions.setBroadcastError(error))
  yield put(updateAccount(ethereum, account))
}

export function* processTransfer(action) {
  const { type } = action.payload

  switch (type) {
    case "privateKey":
    case "keystore":
      yield call(transferKeystoreAndPrivateKey, action)
      break
    case "trezor":
    case "ledger":
      yield call(transferColdWallet, action)
      break
    case "metamask":
      yield call(transferMetamask, action)
      break
  }
}

function* doBeforeMakeTransaction(txRaw) {
  yield put(exchangeActions.goToStep(4))

  var state = store.getState()
  var ethereum = state.connection.ethereum

  yield call([ethereum, ethereum.call], "getTxHash", txRaw)

  return true
}

function* transferKeystoreAndPrivateKey(action) {
  let {
    formId, ethereum, address, token, amount, destAddress, nonce, gas, gasPrice, keystring, type, password,
    account, data, keyService, balanceData, commissionID, commissionFee, paymentData, hint, sourceTokenSymbol } = action.payload;
  const networkId = common.getNetworkId();
  let rawTx, hash;

  if (sourceTokenSymbol !== "ETH") {
    const isPayMode = checkIsPayMode();
    const remain = yield call([ethereum, ethereum.call], "getAllowanceAtLatestBlock", token, address, isPayMode);
    const remainBigNumber = converter.hexToBigNumber(remain);
    const sourceAmountBigNumber = converter.hexToBigNumber(amount);
    let approveRaw, approveZeroRaw;

    if (!remainBigNumber.isGreaterThanOrEqualTo(sourceAmountBigNumber)) {
      if (remain != 0) {
        try {
          approveZeroRaw = yield call(keyService.callSignTransaction, "getApproveToken", isPayMode, ethereum, token,
            amount, nonce, gas, gasPrice, keystring, password, type, address, networkId, true);
        } catch (e) {
          yield put(actions.throwPassphraseError(e.message));
          return;
        }

        try {
          yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", approveZeroRaw);
          yield put(incManualNonceAccount(account.address));
          nonce++;
        } catch (e) {
          yield call(doTxFail, ethereum, account, e.message);
          return;
        }
      }

      try {
        approveRaw = yield call(keyService.callSignTransaction, "getApproveToken", isPayMode, ethereum, token,
          amount, nonce, gas, gasPrice, keystring, password, type, address, networkId)
      } catch (e) {
        yield put(actions.throwPassphraseError(e.message))
        return
      }

      try {
        yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", approveRaw);
        yield put(incManualNonceAccount(account.address));
        nonce++;
      } catch (e) {
        yield call(doTxFail, ethereum, account, e.message);
        return;
      }
    }
  }

  try {
    rawTx = yield callService(keyService, formId, ethereum, address, token, amount, destAddress, nonce,
      gas, gasPrice, keystring, type, password, networkId, commissionID, commissionFee, paymentData, hint);
  } catch (e) {
    yield put(exchangeActions.throwPassphraseError(e.message));
    return
  }

  try {
    yield put(actions.prePareBroadcast(balanceData));
    yield call(doBeforeMakeTransaction, rawTx);
    hash = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", rawTx);
    yield call(runAfterBroadcastTx, ethereum, rawTx, hash, account, data);
  } catch (e) {
    yield call(doTxFail, ethereum, account, e.message)
  }
}

function* transferColdWallet(action) {
  const { formId, ethereum, address, token, amount, destAddress, nonce, gas, gasPrice, keystring, type, password,
    account, data, keyService, balanceData, commissionID, commissionFee, paymentData, hint } = action.payload;

  var networkId = common.getNetworkId()

  try {
    var rawTx
    try {
      rawTx = yield callService(keyService, formId, ethereum, address, token, amount, destAddress, nonce,
        gas, gasPrice, keystring, type, password, networkId, commissionID, commissionFee, paymentData, hint);
    } catch (e) {
      let msg = ''
      if (isLedgerError(type, e)) {
        msg = keyService.getLedgerError(e.native)
      }
      yield put(exchangeActions.setSignError(msg))
      return
    }

    yield put(exchangeActions.prePareBroadcast(balanceData))

    var response = yield call(doBeforeMakeTransaction, rawTx)
    console.log(response)

    const hash = yield call([ethereum, ethereum.callMultiNode], "sendRawTransaction", rawTx)
    yield call(runAfterBroadcastTx, ethereum, rawTx, hash, account, data)
  } catch (e) {
    let msg = ''
    if (isLedgerError(type, e)) {
      msg = keyService.getLedgerError(e.native)
    } else {
      msg = e.message
    }
    yield call(doTxFail, ethereum, account, msg)
    return
  }
}

function* transferMetamask(action) {
  const {
    formId, ethereum, address, token, amount, destAddress, nonce, gas, gasPrice, keystring, type, password,
    account, data, keyService, balanceData, commissionID, commissionFee, paymentData, hint } = action.payload;

  var networkId = common.getNetworkId()

  try {
    var hash
    try {
      hash = yield callService(keyService, formId, ethereum, address, token, amount, destAddress, nonce,
        gas, gasPrice, keystring, type, password, networkId, commissionID, commissionFee, paymentData, hint);
    } catch (e) {
      console.log(e)
      yield put(exchangeActions.setSignError(e))
      return
    }

    yield put(exchangeActions.prePareBroadcast(balanceData))
    const rawTx = { gas, gasPrice, nonce }
    yield call(runAfterBroadcastTx, ethereum, rawTx, hash, account, data)
  } catch (e) {
    console.log(e)
    let msg = converter.sliceErrorMsg(e.message)
    yield call(doTxFail, ethereum, account, msg)
    return
  }
}

function* callService(keyService, formId, ethereum, address, token, amount, destAddress, nonce,
  gas, gasPrice, keystring, type, password, networkId, commissionID, commissionFee, paymentData, hint) {
  let service;
  let toContract;

  if (checkIsPayMode()) {
    toContract = common.getPayWrapperAddress();
    service = token == constants.ETHER_ADDRESS ? "sendEtherPayment" : "sendTokenPayment";

    return yield call(
      keyService.callSignTransaction, service, formId, ethereum, address, token, amount, destAddress,
      nonce, gas, gasPrice, keystring, type, password, networkId, toContract, commissionID, commissionFee, paymentData, hint
    );
  } else {
    service = token == constants.ETHER_ADDRESS ? "sendEtherFromAccount" : "sendTokenFromAccount"

    return yield call(
      keyService.callSignTransaction, service, formId, ethereum, address, token,
      amount, destAddress, nonce, gas, gasPrice, keystring, type, password, networkId
    );
  }
}

function* getMaxGasTransfer() {
  const state = store.getState();
  const transfer = state.transfer;
  const specialGasLimit = constants.SPECIAL_TRANSFER_GAS_LIMIT[transfer.tokenSymbol];

  if (!specialGasLimit) {
    return transfer.gas_limit;
  }

  return specialGasLimit;
}

function* estimateGasUsedWhenChangeAmount(action) {
  var amount = action.payload

  var state = store.getState()
  var transfer = state.transfer
  var tokens = state.tokens.tokens

  var decimal = 18
  var tokenSymbol = transfer.tokenSymbol
  if (tokens[tokenSymbol]) {
    decimal = tokens[tokenSymbol].decimals
  }

  var account = state.account.account
  var fromAddr = account.address

  var gasRequest = yield call(common.handleRequest, calculateGasUse, fromAddr, tokenSymbol, transfer.token, decimal, amount)
  if (gasRequest.status === "success") {
    const gas = gasRequest.data
    yield put(actions.setGasUsed(gas))
  }
  if ((gasRequest.status === "timeout") || (gasRequest.status === "fail")) {
    var gasLimit = yield call(getMaxGasTransfer)
    yield put(actions.setGasUsed(gasLimit))
  }
}

function* fetchGasSnapshot() {
  var state = store.getState()
  var transfer = state.transfer
  var tokens = state.tokens.tokens

  var decimal = 18
  var tokenSymbol = transfer.tokenSymbol
  if (tokens[tokenSymbol]) {
    decimal = tokens[tokenSymbol].decimal
  }

  var account = state.account.account
  var fromAddr = account.address
  var gasRequest = yield call(common.handleRequest, calculateGasUse, fromAddr, tokenSymbol, transfer.token, decimal, transfer.amount)
  if (gasRequest.status === "success") {
    const gas = gasRequest.data
    yield put(actions.setGasUsedSnapshot(gas))
  }
  if ((gasRequest.status === "timeout") || (gasRequest.status === "fail")) {
    var gasLimit = yield call(getMaxGasTransfer)
    yield put(actions.setGasUsedSnapshot(gasLimit))
  }

  yield put(actions.fetchSnapshotGasSuccess())
}

function* calculateGasUse(fromAddr, tokenSymbol, tokenAddr, tokenDecimal, sourceAmount) {
  var state = store.getState()
  var ethereum = state.connection.ethereum
  var transfer = state.transfer
  const amount = converter.stringToHex(sourceAmount, tokenDecimal)
  var gasLimit = yield call(getMaxGasTransfer)
  var gas = 0
  var internalAdrr = "0x3cf628d49ae46b49b210f0521fbd9f82b461a9e1"
  var txObj
  if (tokenSymbol === 'ETH') {
    var destAddr = transfer.destAddress !== "" ? transfer.destAddress : internalAdrr
    txObj = {
      from: fromAddr,
      value: amount,
      to: destAddr
    }
    try {
      gas = yield call([ethereum, ethereum.call], "estimateGas", txObj)
      if (gas > 21000) {
        gas = Math.round(gas * 120 / 100)
      }
      return { status: "success", res: gas }
      //  yield put(actions.setGasUsed(gas))
    } catch (e) {
      console.log(e.message)
      return { "status": "success", res: gasLimit }
      //yield put(actions.setGasUsed(gasLimit))
    }
  } else {
    try {
      var destAddr = transfer.destAddress !== "" ? transfer.destAddress : internalAdrr
      var data = yield call([ethereum, ethereum.call], "sendTokenData", tokenAddr, amount, destAddr)
      txObj = {
        from: fromAddr,
        value: "0",
        to: tokenAddr,
        data: data
      }
      gas = yield call([ethereum, ethereum.call], "estimateGas", txObj)
      gas = Math.round(gas * 120 / 100)
      return { "status": "success", res: gas }
    } catch (e) {
      console.log(e.message)
      return { "status": "success", res: gasLimit }
    }
  }
}

export function* verifyTransfer() {
  var state = store.getState()
  var transfer = state.transfer

  var amount = transfer.amount
  if (isNaN(amount) || amount === "") {
    amount = 0
  }

  var testBalanceWithFee = validators.verifyBalanceForTransaction(state.tokens.tokens['ETH'].balance,
    transfer.tokenSymbol, amount, transfer.gas, transfer.gasPrice)
  if (testBalanceWithFee) {
    yield put(actions.thowErrorEthBalance("error.eth_balance_not_enough_for_fee"))
  } else {
    yield put(actions.thowErrorEthBalance(""))
  }
}

function isLedgerError(accountType, error) {
  return accountType === "ledger" && error.hasOwnProperty("native");
}

function checkIsPayMode() {
  const state = store.getState();

  return !state.exchange.isSwap;
}

export function* watchTransfer() {
  yield takeEvery("TRANSFER.PROCESS_TRANSFER", processTransfer)
  yield takeEvery("TRANSFER.TRANSFER_SPECIFY_AMOUNT", estimateGasUsedWhenChangeAmount)
  yield takeEvery("TRANSFER.FETCH_GAS_SNAPSHOT", fetchGasSnapshot)
  yield takeEvery("TRANSFER.VERIFY_TRANSFER", verifyTransfer)
}
