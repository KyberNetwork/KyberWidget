import * as converter from "../utils/converter"

export function selectTokenAsync(symbol, address, type, ethereum) {
  return {
    type: "EXCHANGE.SELECT_TOKEN_ASYNC",
    payload: { symbol, address, type, ethereum }
  }
}
export function setLoadingSelectToken(isLoading = true) {
  return {
    type: "EXCHANGE.SET_LOADING_SELECT_TOKEN",
    payload: isLoading
  }
}
export function selectToken(symbol, address, type) {
  return {
    type: "EXCHANGE.SELECT_TOKEN",
    payload: { symbol, address, type }
  }
}
export function checkSelectToken(sameTokenError) {
  return {
    type: "EXCHANGE.CHECK_SELECT_TOKEN",
    payload: sameTokenError
  }
}

export function caculateAmount() {
  return {
    type: "EXCHANGE.CACULATE_AMOUNT"
  }
}

export function caculateAmountInSnapshot() {
  return {
    type: "EXCHANGE.CACULATE_AMOUNT_SNAPSHOT"
  }
}

export function inputChange(focus, value) {
  return {
    type: "EXCHANGE.INPUT_CHANGE",
    payload: { focus, value }
  }
}

export function focusInput(focus) {
  return {
    type: "EXCHANGE.FOCUS_INPUT",
    payload: focus
  }
}

export function thowErrorSourceAmount(message) {
  return {
    type: "EXCHANGE.THROW_SOURCE_AMOUNT_ERROR",
    payload: message
  }
}

export function thowErrorEthBalance(message) {
  return {
    type: "EXCHANGE.THROW_ETH_BALANCE_ERROR",
    payload: message
  }
}

export function goToStep(step, oldStep) {
  return {
    type: "EXCHANGE.GO_TO_STEP",
    payload: { step, oldStep }
  }
}

export function specifyGas(value) {
  return {
    type: "EXCHANGE.SPECIFY_GAS",
    payload: value
  }
}

export function seSelectedGas(level) {
  return {
    type: "EXCHANGE.SET_SELECTED_GAS",
    payload: { level: level }
  }
}

export function specifyGasPrice(value) {
  return {
    type: "EXCHANGE.SPECIFY_GAS_PRICE",
    payload: value
  }
}

export function updateRateExchange(source, dest,
  sourceAmount, sourceTokenSymbol, isManual = false) {
  return {
    type: "EXCHANGE.UPDATE_RATE_PENDING",
    payload: { source, dest, sourceAmount, sourceTokenSymbol, isManual }
  }
}

export function updateRateSnapshot(ethereum) {
  return {
    type: "EXCHANGE.UPDATE_RATE_SNAPSHOT",
    payload: ethereum
  }
}

export function updateRateExchangeComplete(rateInit, expectedPrice, slippagePrice, blockNo, isManual, isSuccess, errors) {
  return {
    type: "EXCHANGE.UPDATE_RATE",
    payload: { rateInit, expectedPrice, slippagePrice, blockNo, isManual, isSuccess, errors }
  }
}

export function updateRateSnapshotComplete(rateInit, expectedPrice, slippagePrice) {
  return {
    type: "EXCHANGE.UPDATE_RATE_SNAPSHOT_COMPLETE",
    payload: { rateInit, expectedPrice, slippagePrice: converter.toT(slippagePrice, 18), rateInitSlippage: converter.toT(rateInit, 18) }
  }

}

export function hidePassphrase() {
  return {
    type: "EXCHANGE.HIDE_PASSPHRASE",
  }
}

export function hideConfirm() {
  return {
    type: "EXCHANGE.HIDE_CONFIRM",
  }
}

export function showConfirm() {
  return {
    type: "EXCHANGE.SHOW_CONFIRM",
  }
}

export function hideApprove() {
  return {
    type: "EXCHANGE.HIDE_APPROVE",
  }
}

export function showApprove() {
  return {
    type: "EXCHANGE.SHOW_APPROVE",
  }
}

export function prePareBroadcast(balanceData) {
  return {
    type: "EXCHANGE.PREPARE_BROADCAST",
    payload: { balanceData }
  }
}

export function finishExchange() {
  return {
    type: "EXCHANGE.FINISH_EXCHANGE"
  }
}

export function throwPassphraseError(message) {
  return {
    type: "EXCHANGE.THROW_ERROR_PASSPHRASE",
    payload: message
  }
}

export function processExchange(
  formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
  throwOnFailure, nonce, gas, gasPrice, keystring, type, password, account, data, keyService, balanceData,
  sourceTokenSymbol, blockNo, commissionFee, paymentData, hint) {
  return {
    type: "EXCHANGE.PROCESS_EXCHANGE",
    payload: {
      formId, ethereum, address, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
      throwOnFailure, nonce, gas, gasPrice, keystring, type, password, account, data, keyService, balanceData,
      sourceTokenSymbol, blockNo, commissionFee, paymentData, hint
    }
  }
}

export function doApprove(ethereum, sourceToken, sourceAmount, nonce, gas, gasPrice,
  keystring, password, accountType, account, keyService, sourceTokenSymbol, isApproveZero = false) {
  return {
    type: "EXCHANGE.PROCESS_APPROVE",
    payload: {
      ethereum, sourceToken, sourceAmount, nonce, gas, gasPrice, keystring,
      password, accountType, account, keyService, sourceTokenSymbol, isApproveZero
    }
  }
}

export function doTransactionComplete(txHash) {
  return {
    type: "EXCHANGE.TX_BROADCAST_FULFILLED",
    payload: txHash,
  }
}

export function doApprovalTransactionComplete(txHash, id) {
  return {
    type: "EXCHANGE.APPROVAL_TX_BROADCAST_FULFILLED",
    payload: txHash,
    meta: id,
  }
}

export function doApprovalTransactionFail(error) {
  return {
    type: "EXCHANGE.APPROVAL_TX_BROADCAST_REJECTED",
    payload: error,
  }
}

export function resetSignError() {
  return {
    type: "EXCHANGE.RESET_SIGN_ERROR",
  }
}

export function setSignError(error) {
  return {
    type: "EXCHANGE.SET_SIGN_ERROR",
    payload: error,
  }
}

export function setBroadcastError(error) {
  return {
    type: "EXCHANGE.SET_BROADCAST_ERROR",
    payload: error,
  }
}

export function makeNewExchange() {
  return {
    type: "EXCHANGE.MAKE_NEW_EXCHANGE"
  }
}

export function setMinRate(value) {
  return {
    type: "EXCHANGE.SET_MIN_RATE",
    payload: { value }
  }
}

export function estimateGas() {
  return {
    type: "EXCHANGE.ESTIMATE_GAS_USED",
  }
}

export function setEstimateGas(gas, gas_approve) {
  return {
    type: "EXCHANGE.SET_GAS_USED",
    payload: { gas, gas_approve }
  }
}

export function setEstimateGasSnapshot(gas, gas_approve) {
  return {
    type: "EXCHANGE.SET_GAS_USED_SNAPSHOT",
    payload: { gas, gas_approve }
  }
}

export function swapToken(source, dest) {
  return {
    type: "EXCHANGE.SWAP_TOKEN",
    payload: { source, dest }
  }
}

export function setCapExchange(maxCap) {
  return {
    type: "EXCHANGE.SET_CAP_EXCHANGE",
    payload: { maxCap }
  }
}

export function thowErrorNotPossessKGt(message) {
  return {
    type: "EXCHANGE.THROW_NOT_POSSESS_KGT_ERROR",
    payload: message
  }
}

export function setMaxGasPrice(ethereum) {
  return {
    type: "EXCHANGE.SET_MAX_GAS_PRICE",
    payload: ethereum
  }
}

export function setMaxGasPriceComplete(maxGasPriceGwei) {
  return {
    type: "EXCHANGE.SET_MAX_GAS_PRICE_COMPLETE",
    payload: maxGasPriceGwei
  }
}

export function setGasPriceSwapComplete(safeLowGas, standardGas, fastGas, defaultGas, selectedGas) {
  return {
    type: "EXCHANGE.SET_GAS_PRICE_SWAP_COMPLETE",
    payload: { safeLowGas, standardGas, defaultGas, fastGas, selectedGas }
  }
}

export function fetchGas() {
  return {
    type: "EXCHANGE.FETCH_GAS"
  }
}

export function fetchGasSuccess() {
  return {
    type: "EXCHANGE.FETCH_GAS_SUCCESS"
  }
}

export function fetchGasSuccessSnapshot() {
  return {
    type: "EXCHANGE.FETCH_GAS_SUCCESS_SNAPSHOT"
  }
}

export function checkKyberEnable() {
  return {
    type: "EXCHANGE.CHECK_KYBER_ENABLE"
  }
}

export function setKyberEnable(enable) {
  return {
    type: "EXCHANGE.SET_KYBER_ENABLE",
    payload: enable
  }
}

export function setApproveTx(hash, symbol) {
  return {
    type: "EXCHANGE.SET_APPROVE_TX",
    payload: { hash, symbol }
  }
}

export function removeApproveTx(symbol) {
  return {
    type: "EXCHANGE.REMOVE_APPROVE_TX",
    payload: { symbol }
  }
}

export function setSnapshot(data) {
  //data.isFetchingRate = true
  return {
    type: "EXCHANGE.SET_SNAPSHOT",
    payload: data
  }
}

export function setSnapshotGasPrice(gasPrice) {
  return {
    type: "EXCHANGE.SET_SNAPSHOT_GAS_PRICE",
    payload: gasPrice
  }
}

export function setSnapshotMinConversionRate(minConversionRate) {
  return {
    type: "EXCHANGE.SET_SNAPSHOT_MIN_CONVERSION_RATE",
    payload: minConversionRate
  }
}

export function verifyExchange() {
  return {
    type: "EXCHANGE.VERIFY_EXCHANGE",
  }
}

export function setExchangeEnable(enable) {
  return {
    type: "EXCHANGE.SET_EXCHANGE_ENABLE",
    payload: enable
  }
}

export function updateBalanceData(balanceData, hash) {
  return {
    type: "EXCHANGE.UPDATE_BALANCE_DATA",
    payload: { balanceData, hash }
  }
}

export function throwErrorHandleAmount() {
  return {
    type: "EXCHANGE.HANDLE_AMOUNT"
  }
}

export function resetHandleAmountError() {
  return {
    type: "EXCHANGE.RESET_HANDLE_AMOUNT_ERROR"
  }
}


export function initParamsExchange(
  receiveAddr, receiveToken, tokenAddr, receiveAmount, products, callback, network, paramForwarding,
  signer, commissionID, commissionFee, isSwap, type, pinnedTokens, defaultPairArr, paymentData, hint, tokens, theme, title
) {
  return {
    type: "EXCHANGE.INIT_PARAMS_EXCHANGE",
    payload: {
      receiveAddr, receiveToken, tokenAddr, receiveAmount, callback, products, network, paramForwarding,
      signer, commissionID, commissionFee, isSwap, type, pinnedTokens, defaultPairArr, paymentData, hint, tokens, theme, title
    }
  }
}

export function setApprove(isNeedApprove) {
  return {
    type: "EXCHANGE.SET_APPROVE",
    payload: { isNeedApprove }
  }
}

export function throwErrorExchange(key, val) {
  return {
    type: "EXCHANGE.THROW_ERROR_EXCHANGE",
    payload: { key, val }
  }
}

export function validateAccountComplete() {
  return {
    type: "EXCHANGE.VALIDATE_ACCOUNT_COMPLETE"
  }
}

export function selectTokenComplete() {
  return {
    type: "EXCHANGE.SELECT_TOKEN_COMPLETE"
  }
}

export function unsetConfirming() {
  return {
    type: "EXCHANGE.UNSET_CONFIRMING"
  }
}


export function updateReceiveAddress(address) {
  return {
    type: "EXCHANGE.UPDATE_RECEIVE_ADDRESS",
    payload: { address }
  }
}


export function updateSourceToken(sourceTokenSymbol, source) {
  return {
    type: "EXCHANGE.UPDATE_SOURCE_TOKEN",
    payload: { sourceTokenSymbol, source }
  }
}

export function changeDefaultTokens(sourceSymbol, sourceAddress, destSymbol, destAddress) {
  return {
    type: "EXCHANGE.CHANGE_DEFAULT_TOKEN",
    payload: { sourceSymbol, sourceAddress, destSymbol, destAddress }
  }
}

export function setSourceAmount(amount) {
  return {
    type: "EXCHANGE.SET_SOURCE_AMOUNT",
    payload: amount
  }
}

export function setIsApproveZero(isApproveZero) {
  return {
    type: "EXCHANGE.SET_IS_APPROVE_ZERO",
    payload: isApproveZero
  }
}

export function setFluctuatingRate(fluctuatingRate) {
  return {
    type: "EXCHANGE.SET_FLUCTUATING_RATE",
    payload: fluctuatingRate
  }
}

export function setSrcAmountLoading(isLoading) {
  return {
    type: "EXCHANGE.SET_SRC_AMOUNT_LOADING",
    payload: isLoading
  }
}

export function setDestAmountLoading(isLoading) {
  return {
    type: "EXCHANGE.SET_DEST_AMOUNT_LOADING",
    payload: isLoading
  }
}
