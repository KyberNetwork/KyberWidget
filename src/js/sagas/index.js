import { fork, all } from 'redux-saga/effects'
import { watchAccount } from './accountActions';
import { watchGlobal } from './globalActions';
import { watchExchange } from './exchangeActions';
import { watchTransfer } from './transferActions';
import { watchTx } from './txActions';
import { watchMarket } from './marketActions'

export default function* root() {
  yield all([
    fork(watchAccount),
    fork(watchGlobal),
    fork(watchExchange),
    fork(watchTransfer),
    fork(watchTx),
    fork(watchMarket)
  ])
}
