export function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


export function getActiveLanguage(langs){
    for (var i = 0; i< langs.length; i++){
      if (langs[i].active){
        return langs[i].code
      }
    }
    return "en"
}


export function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

export function queryParamsString (url) {
	var params = {}
	var parser = document.createElement('a');
	parser.href = url
	var query = parser.search.substring(1);
	var vars = query.split('&')
	for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    if (pair[0] === "") continue
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params
}


export function findNetworkName(networkId){
    switch(networkId){
      case 0:
       return "Olympic Network"
      case 1:
        return "Mainnet"
      case 2:
        return "Morden Network"
      case 3:
        return "Ropsten Network"
      case 4:
        return "Rinkeby Network"
      case 42:
        return "Kovan Network"
      default:
        return null
    }
  }


export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function lineToCamel(str){
  var arrKeys = str.split("-")
  var key = arrKeys[0]
  for (var j = 1; j < arrKeys.length; j++){
    key += capitalizeFirstLetter(arrKeys[j])
  }
  return key
}




export function checkComponentExist(componentId){
  if(document.getElementById(componentId)){
    return true
  }else{
    return false
  }
}