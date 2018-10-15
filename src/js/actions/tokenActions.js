

export function selectToken(symbol, type) {
	 return {
	    type: "TOKEN.SELECT_TOKEN",
	    payload: {symbol, type}
	  }
}



// export function initListTokens(tokens, network){
// 	return {
// 		type: "TOKEN.INIT_LIST_TOKEN",
// 		payload: {tokens, network}
// 	}
// }