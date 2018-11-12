export function updateBlock(ethereum) {
  return {
    type: "GLOBAL.NEW_BLOCK_INCLUDED_PENDING",
    payload: ethereum
  }
}

export function updateBlockComplete(block) {
  return {
    type: "GLOBAL.NEW_BLOCK_INCLUDED_FULFILLED",
    payload: block
  }
}

export function updateBlockFailed(error) {
  return {
    type: "GLOBAL.GET_NEW_BLOCK_FAILED",
    payload: error
  }
}

export function updateAllRate(ethereum, tokens) {
  return {
    type: 'GLOBAL.RATE_UPDATE_ALL_PENDING',
    payload: { ethereum, tokens}
  }
}

export function updateAllRateComplete(rates,rateUSD) {
  return {
    type: 'GLOBAL.ALL_RATE_UPDATED_FULFILLED',
    payload: { rates, rateUSD}
  }
}

export function updateAllRateUSD(ethereum, tokens){
  return {
    type: 'GLOBAL.UPDATE_RATE_USD_PENDING',
    payload: { ethereum, tokens}
  }
}

export function updateAllRateUSDComplete(rates){
  return {
    type: 'GLOBAL.UPDATE_RATE_USD_FULFILLED',
    payload: {rates}
  }
}

export function showBalanceUSD(){
  return {
    type: 'GLOBAL.SHOW_BALABCE_USD',
  }
}

export function hideBalanceUSD(){
  return {
    type: 'GLOBAL.HIDE_BALABCE_USD',
  }
}

export function clearSession() {
  return {
    type: "GLOBAL.CLEAR_SESSION"
  }
}

export function setBalanceToken(balances){
  return {
    type: "GLOBAL.SET_BALANCE_TOKEN",
    payload: {balances}
  }
}

export function changeLanguage(ethereum, lang, locale){
  return {
    type: "GLOBAL.CHANGE_LANGUAGE",
    payload: {ethereum, lang, locale}
  }
}

export function clearSessionComplete() {
  return {
    type: "GLOBAL.CLEAR_SESSION_FULFILLED"
  }
}

export function checkConnection(ethereum, count, maxCount, isCheck) {
  return {
    type: "GLOBAL.CHECK_CONNECTION",
    payload: { ethereum, count, maxCount, isCheck }
  }
}

export function updateCountConnection(count){
  return {
    type: "GLOBAL.CONNECTION_UPDATE_COUNT",
    payload: count
  }
}

export function setGasPrice(ethereum){
  return {
    type: "GLOBAL.SET_GAS_PRICE",
    payload: ethereum
  }
}

export function throwErrorMematamask(err){
  return {
    type: "GLOBAL.THROW_ERROR_METAMASK",
    payload: { err }
  }
}

export function updateMetamaskAccount(address, balance){
  return {
    type: "GLOBAL.UPDATE_METAMASK_ACCOUNT",
    payload: { address, balance }
  }
}

export function setNotiHandler(notiService) {
  return {
    type: "GLOBAL.SET_NOTI_HANDLER",
    payload: { notiService }
  }
}

export function setMaxGasPrice() {
  return {
    type: "GLOBAL.SET_MAX_GAS_PRICE",
  }
}


export function setNetworkError(error){
  return {
    type: "GLOBAL.SET_NETWORK_ERROR",
    payload: {error}
  }
}


export function initParamsGlobal(params){
  return {
    type: "GLOBAL.INIT_PARAMS",
    payload: {params}
  }
}

export function haltPayment(errors){
  return {
    type: "GLOBAL.HALT_PAYMENT",
    payload: {errors}
  }
}

export function initSession(){
  return {
    type: "GLOBAL.INIT_SESSION"
  }
}


export function initAnalytics(analytics){
  return {
    type: "GLOBAL.INIT_ANALYTICS",
    payload: {analytics}
  }
}
