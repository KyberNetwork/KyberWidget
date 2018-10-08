export function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}


export function getActiveLanguage(langs) {
  for (var i = 0; i < langs.length; i++) {
    if (langs[i].active) {
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

export function queryParamsString(url) {
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


export function findNetworkName(networkId) {
  switch (networkId) {
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

export function lineToCamel(str) {
  var arrKeys = str.split("-")
  var key = arrKeys[0]
  for (var j = 1; j < arrKeys.length; j++) {
    key += capitalizeFirstLetter(arrKeys[j])
  }
  return key
}




export function checkComponentExist(componentId) {
  if (document.getElementById(componentId)) {
    return true
  } else {
    return false
  }
}


export function setCookie(cname, cvalue, exdays) {
  if (!exdays) {
    exdays = 5 * 365
  }
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function submitForm(path, params, method, maxTimeout) {
  method = method || "post"; // Set method to post by default if not specified.

  // The rest of this code assumes you are not using a library.
  // It can be made less wordy if you use one.
  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      var hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", params[key]);

      form.appendChild(hiddenField);
    }
  }
  form.formEnctype = "application/x-www-form-urlencoded";

  //document.body.appendChild(form);
  return new Promise((resolve, reject) => {

    var xhr = new XMLHttpRequest();
    xhr.open(method, path);

    xhr.timeout = maxTimeout
    // var isTimeout = false;
    xhr.ontimeout = function () { 
      reject("time out");
    }

    //console.log("xhr_request")
    xhr.onload = function (event) {
      //console.log("event_data")
      // if (isTimeout) {
      //   rejected(new Error("Timeout error"))
      // }
      if (this.status == 200) {
        resolve(xhr.responseText)
      } else {
        reject(new Error("Server is not response"))
      }
      ///alert("The server responded with: " + event.target.response); 
    }

    xhr.onerror = function (event) {
      //console.log("event_data")
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };




    var formData = new FormData(form);
    xhr.send(formData);

  })

  //form.submit();
}

export function submitUrlEncoded(path, params, method, maxTimeout) {
  var formBody = [];
  for (var property in params) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(params[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");

  return new Promise((resolve, reject) => {
    timeout(maxTimeout, fetch(path, {
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: formBody
    }).then( response => {
       console.log("reponse_data")
      // console.log(response)
      if(response.status === 200){
        resolve(true)
      }else{
        reject("status code is not 200")
      }
      //response.json()
    }
    )).catch(e => {
      reject(e)
    })
  })
}

export function submitPayloadOption(path, params, method, maxTimeout) {
  return new Promise((resolve, reject) => {
    timeout(maxTimeout, fetch(path, {
      method: method,
      // headers: {
      //   'Accept': 'application/json',
      //   'Content-Type': 'application/json'
      // },
      body: JSON.stringify(params)
    }).then(response => response.json())).then(result => {
      resolve(result)
    }).catch(e => {
      reject(e)
    })
  })

}

export function submitPayload(path, params, method, maxTimeout) {
  return new Promise((resolve, reject) => {
    timeout(maxTimeout, fetch(path, {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }).then(response => response.json())).then(result => {
      resolve(result)
    }).catch(e => {
      reject(e)
    })
  })
}

export function timeout(ms, promise) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error("timeout"))
    }, ms)
    promise.then(resolve, reject)
  })
}