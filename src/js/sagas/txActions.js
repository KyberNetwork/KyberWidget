import { put, call, takeEvery } from 'redux-saga/effects'
import { updateTxComplete, removeApproveTx } from '../actions/txActions'
import * as exchangeActions from '../actions/exchangeActions'
import { Rate } from "../services/rate"
import * as converters from "../utils/converter"
import { store } from '../store'

function* updateTx(action) {
  try {
    const { tx, ethereum } = action.payload
    var newTx
    try {
      var state = store.getState()
      var exchange = state.exchange
      newTx = yield call(tx.sync, ethereum, tx, exchange.network)
    }catch(err){
      console.log(err)
      return
    }

    if (newTx.status === "success") {
      if (newTx.type === "exchange") {
        const { src, dest, srcAmount, destAmount } = yield call([ethereum, ethereum.call], "extractExchangeEventData", newTx.eventTrade)

        yield put(exchangeActions.updateBalanceData({src, dest, srcAmount, destAmount}, newTx.hash))

        var state = store.getState()
        const tokens = state.tokens.tokens
        const sourceDecimal = tokens[newTx.data.sourceTokenSymbol].decimals
        const destDecimal = tokens[newTx.data.destTokenSymbol].decimals
        newTx.data.sourceAmount = converters.toT(srcAmount, sourceDecimal)
        newTx.data.destAmount = converters.toT(destAmount, destDecimal)

      }
    }

    try{
      var state = store.getState()
      var notiService = state.global.notiService
      notiService.callFunc("changeStatusTx",newTx)
    }catch(e){
      console.log(e)
    }

    yield put(updateTxComplete(newTx))
  }
  catch (e) {
    console.log(e)
  }

}

function* updateApproveTxs(){
  var state = store.getState()
  const tokens = state.tokens.tokens
  const ethereum = state.connection.ethereum
  for (var key in tokens) {
    if(tokens[key].approveTx){
      try{
        yield call([ethereum, ethereum.call], "txMined", tokens[key].approveTx)
        yield put(exchangeActions.removeApproveTx(key))
      }catch(err){
        console.log(err)
        yield put(exchangeActions.removeApproveTx(key))
      }
    }
  }
}

export function* watchTx() {
  yield takeEvery("TX.UPDATE_TX_PENDING", updateTx)
  yield takeEvery("TX.UPDATE_APPROVE_TXS", updateApproveTxs)
}

