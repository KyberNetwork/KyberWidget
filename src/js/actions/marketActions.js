export function getMarketData(){
  return {
    type: "MARKET.GET_MARKET_DATA"
  }
}

export function getMarketDataComplete(data){
  return {
    type: "MARKET.GET_MARKET_DATA_COMPLETE",
    payload: data
  }
}

export function getGeneralInfoTokens(){
  return {
    type: "MARKET.GET_GENERAL_INFO_TOKENS"
  }
}

export function getVolumn(){
  return {
    type: "MARKET.GET_VOLUMN"
  }
}

export function getMarketInfoSuccess(data, rateUSD) {
  return {
    type: "MARKET.GET_MARKET_INFO_SUCCESS",
    payload: {data, rateUSD}
  }
}
