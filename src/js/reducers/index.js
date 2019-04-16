import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import session from 'redux-persist/lib/storage/session'
import { routerReducer } from 'react-router-redux'
import {initState as initStateAcccount, account} from './accountReducer'
import {initState as initStateTokens, tokens} from './tokensReducer'
import {initState as initStateExchange, exchange} from './exchangeReducer'
import transfer from './transferReducer'
import {initState as initStateGlobal, global} from './globalReducer'
import connection from './connection'
import utils from './utilsReducer'
import {initState as initStateTxs, txs} from './txsReducer'
import { localizeReducer } from 'react-localize-redux';

//console.log(localizeReducer)

const appReducer = combineReducers({
  account, exchange, transfer, connection, router: routerReducer,global,
  locale : localizeReducer,
  tokens, utils,
  txs: persistReducer({
    key: 'txs',
    storage: session
  }, txs),
})

const rootReducer = (state, action) => {
  if (action.type === 'GLOBAL.INIT_SESSION') {
    state.exchange = initStateExchange
    state.global = initStateGlobal
    state.txs = initStateTxs
    state.account = initStateAcccount
    state.tokens = initStateTokens
  }

  return appReducer(state, action)
}

export default rootReducer

