import { fork, call, put, join, race, cancel } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { store } from '../store'


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



export function* submitCallback(hash){
    console.log("submit_hash: " + hash)
    var state = store.getState()
    var exchange = state.exchange
    if (exchange.callback){
      var submitUrl = exchange.callback + "?tx=" + hash
      if (exchange.paramForwarding === true || exchange.paramForwarding === 'true'){
        var global = state.global
        Object.keys(global.params).map(key=>{
          var value = global.params[key]
          submitUrl += `&${key}=${value}`
        })
      }
      try{
        const response = yield call(fetch, submitUrl)   
        const responseBody = response.json()
        console.log("status_submit")
        console.log(responseBody)  
      }catch(e){
        console.log(e)
      }
      
    }
}