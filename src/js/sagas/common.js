import { fork, call, put, join, race, cancel } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { store } from '../store'
import BLOCKCHAIN_INFO from "../../../env";
import * as commonFunc from "../utils/common"


export function* handleRequest(sendRequest, ...args) {
	const task = yield fork(sendRequest, ...args)

	const { res, timeout } = yield race({
		res: join(task),
		timeout: call(delay, 9 * 1000)
    })
        
	if (timeout) {     
        //console.log("timeout")
        yield cancel(task)
        return {status: "timeout"}   
    }

    if (res.status === "success"){
        return { status: "success", data: res.res }    
    }else{
        return { status: "fail", data: res.err }    
    }
   // return { status: "success", data: res }

    // console.log(res)
	// if (res.err) {
    //     return new Promise(resolve => {
    //         resolve ({
    //             status: "error",
    //             data: res.err
    //         })
    //     })
	// }
}

export function getNetworkId(){
  var state = store.getState()
  var exchange = state.exchange
  return BLOCKCHAIN_INFO[exchange.network].networkId
}

export function getKyberAddress(){
  var state = store.getState()
  var exchange = state.exchange
  return BLOCKCHAIN_INFO[exchange.network].network
}

export function* submitCallback(hash){
    console.log("submit_hash: " + hash)
    var state = store.getState()
    var exchange = state.exchange
    var global = state.global
    if (exchange.callback){
      var submitUrl = exchange.callback 
      var params = {
        tx: hash,
       // network: global.params.network
      }
      if (exchange.paramForwarding !== false && exchange.paramForwarding !== 'false'){
        Object.keys(global.params).map(key=>{
          if (key !== "tx"){
            params[key] = global.params[key]
          }
        })
      }

      try {
        if (!params.network){
          params.network = BLOCKCHAIN_INFO[exchange.network].networkName;
        }

        return yield call(retrySubmit, submitUrl, params, 'POST', 3000)
      } catch(e) {
        throw e;
      }
    }else{
      return true
    }
}

export function* retrySubmit(path, params, method, timeout){
  let retryTime = 0;

  while(retryTime < 5) {
    console.log("re try submit")
    try{
      var response = yield call(commonFunc.submitUrlEncoded, path, params, method, timeout)
      console.log(response)
      return true
    } catch(e) {
      retryTime++;
      console.log(e);
      yield call(delay, 1000);
      continue;
    }
  }

  throw Error("There is something wrong with the system, please contact the merchant for more information");
}


export function* submitData(path, params, method, timeout){
  var maxTry = 3
  console.log("retry_callback")
  for (var i = 0; i < maxTry; i++){
    console.log("callback_times: " + i)
    try{
       var response = yield call(commonFunc.submitUrlEncoded, path, params, method, timeout)
       console.log(response)
       if (response.success){
         return true
       }
    }catch(e){
      console.log(e)    
    }
    
    try{
      var response = yield call(commonFunc.submitForm, path, params, method, timeout)
      console.log(response)
      if (response.success){
        return true
      }
    }catch(e){
      console.log(e)    
    }

    try{
      var response = yield call(commonFunc.submitPayloadOption, path, params, method, timeout)
      console.log(response)
      if (response.success){
        return true
      }
    }catch(e){
      console.log(e)    
    }

    try{
      var response = yield call(commonFunc.submitPayload, path, params, method, timeout)
      console.log(response)
      if (response.success){
        return true
      }
    }catch(e){
      console.log(e)    
    }

  }
  return false
}

