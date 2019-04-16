import { put, call, takeEvery } from 'redux-saga/effects'
import * as marketActions from "../actions/marketActions"
import * as globalActions from "../actions/globalActions"
import { store } from '../store'

export function* getData(action) {
    var state = store.getState()
    var ethereum = state.connection.ethereum
    try {
        var data = yield call([ethereum, ethereum.call], "getMarketData")
        yield put(marketActions.getMarketDataComplete(data))
    }catch(e){
        console.log(e)
    }
}

export function* getVolumn(){
    var state = store.getState()
    var ethereum = state.connection.ethereum
    var tokens = state.tokens.tokens
    try {
        const rates = yield call([ethereum, ethereum.call],"getAllRates", tokens)
        yield put.resolve(globalActions.updateAllRateComplete(rates))

        const rateUSDETH = yield call([ethereum, ethereum.call],"getRateETH")

        // use new cached api
        var newData = yield call([ethereum, ethereum.call], "getMarketInfo")
        yield put(marketActions.getMarketInfoSuccess(newData.data, rateUSDETH))
    }catch(e){
        console.log(e)
    }
}

export function* watchMarket() {
  yield takeEvery("MARKET.GET_MARKET_DATA", getData)
  yield takeEvery("MARKET.GET_VOLUMN", getVolumn)
}
