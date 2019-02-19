export function showConfirm() {
  return {
    type: "TRANSFER.SHOW_CONFIRM",

  }
}

export function thowErrorEthBalance(message){
  return {
    type: "TRANSFER.THROW_ETH_BALANCE_ERROR",
    payload: message
  }
}

export function prePareBroadcast(balanceData) {
  return {
    type: "TRANSFER.PREPARE_TRANSACTION",
    payload: {balanceData: balanceData}
  }
}

export function throwPassphraseError(message) {
  return {
    type: "TRANSFER.THROW_ERROR_PASSPHRASE",
    payload: message
  }
}

export function processTransfer(
  formId, ethereum, address, token, amount, destAddress, nonce, gas, gasPrice, keystring,
  type, password, account, data, keyService, balanceData, commissionID, paymentData, hint, sourceTokenSymbol
) {
  return {
    type: "TRANSFER.PROCESS_TRANSFER",
    payload: {
      formId, ethereum, address, token, amount, destAddress, nonce, gas, gasPrice, keystring,
      type, password, account, data, keyService, balanceData, commissionID, paymentData, hint, sourceTokenSymbol
    }
  }
}

export function fetchSnapshotGasSuccess(){
  return {
    type: "TRANSFER.FETCH_SNAPSHOT_GAS_SUCCESS"
  }
}

export function estimateGasTransfer(){
  return {
    type: "TRANSFER.ESTIMATE_GAS_USED"
  }
}

export function setGasUsed(gas){
  return {
    type: "TRANSFER.SET_GAS_USED",
    payload: {gas}
  }
}

export function setGasUsedSnapshot(gas){
  return {
    type: "TRANSFER.SET_GAS_USED_SNAPSHOT",
    payload: {gas}
  }
}

export function verifyTransfer(){
  return {
    type: "TRANSFER.VERIFY_TRANSFER",
  }
}
