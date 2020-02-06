import React from 'react';
import BLOCKCHAIN_INFO from "../../../../../env"

export default class CachedServerProvider extends React.Component {
  constructor(props) {
    super(props)
    this.rpcUrl = props.url
    this.network = props.network
  }

  getGasPrice() {
    return new Promise((resolve, rejected) => {
      fetch(this.rpcUrl + '/gasPrice', {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        return response.json()
      }).then((result) => {
        if (result.success) {
          resolve(result.data)
        } else {
          rejected(new Error("Cannot get gas price from server"))
        }
      })
        .catch((err) => {
          console.log(err.message)
          rejected(new Error("Cannot get gas price from server"))
        })
    })
  }

  getGasLimit(srcTokenAddress, destTokenAddress, srcAmount) {
    if (!srcAmount) srcAmount = 0;

    return new Promise((resolve, reject) => {
      fetch( `${BLOCKCHAIN_INFO[this.network].api_url}/gas_limit?source=${srcTokenAddress}&dest=${destTokenAddress}&amount=${srcAmount}`)
        .then((response) => {
          resolve(response.json())
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  checkKyberEnable() {
    return new Promise((resolve, rejected) => {
      fetch(this.rpcUrl + '/kyberEnabled', {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        return response.json()
      }).then((result) => {
        if (result.success) {
          resolve(result.data)
        } else {
          rejected(new Error("Cannot check kyber enable from server"))
        }
      })
        .catch((err) => {
          console.log(err.message)
          rejected(new Error("Cannot check kyber enable from server"))
        })
    })
  }

  getMaxGasPrice() {
    return new Promise((resolve, rejected) => {
      fetch(this.rpcUrl + '/maxGasPrice', {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        return response.json()
      }).then((result) => {
        if (result.success) {
          resolve(result.data)
        } else {
          rejected(new Error("Cannot get max gas price from server"))
        }
      })
        .catch((err) => {
          console.log(err.message)
          rejected(new Error("Cannot get max gas price from server"))
        })
    })
  }

  getLatestBlock() {
    return new Promise((resolve, rejected) => {
      fetch(this.rpcUrl + '/latestBlock', {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        return response.json()
      }).then((result) => {
        if (result.success) {
          resolve(result.data)
        } else {
          rejected(new Error("Cannot get latest block from server"))
        }
      })
        .catch((err) => {
          rejected(new Error("Cannot get latest block from server"))
        })
    })
  }

  getAllRates(tokensObj) {
    return new Promise((resolve, rejected) => {
      fetch(this.rpcUrl + '/rate', {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
      })
        .then((response) => {
          return response.json()
        })
        .then(result =>  {
          if(result.success){
            resolve(result.data)
          }else{
            rejected(new Error ("Rate server is not fetching"))
          }
        })
        .catch((err) => {
          rejected(err)
        })
    })
  }

  getAllRatesUSD() {
    return new Promise((resolve, rejected) => {
      fetch(this.rpcUrl + '/rateUSD', {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
      }).then((response) => {
        return response.json()
      })
        .then( (result) => {
          if(result.success){
            resolve(result.data)
          }else{
            rejected(new Error("RateUSD server is not fetching"))
          }
        })
        .catch((err) => {
          rejected(err)
        })
    })
  }

  getRateETH() {
    return new Promise((resolve, rejected) => {
      fetch(this.rpcUrl + '/rateETH', {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
      }).then((response) => {
        return response.json()
      })
        .then( (result) => {
          if(result.success){
            resolve(result.data)
          }else{
            rejected(new Error("RateETHs server is not fetching"))
          }
        })
        .catch((err) => {
          rejected(err)
        })
    })
  }

  getLanguagePack(lang) {
    return new Promise((resolve, rejected) => {
      rejected(new Error("This api /getLanguagePack will comming soon"))
    })
  }

  getInfo(infoObj) {
    console.log(infoObj)
    fetch('https://broadcast.kyber.network/broadcast/' + infoObj.hash, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return new Promise((resolve, rejected) => {
      resolve("get_info_successfully")
    })
  }

  getMarketData() {
    return new Promise((resolve, rejected) => {
      fetch(this.rpcUrl + '/marketData', {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
      }).then((response) => {
        return response.json()
      })
        .then( (result) => {
          if(result.success){
            resolve(result.data)
          }else{
            rejected(new Error("Market data is not fetching"))
          }
        })
        .catch((err) => {
          rejected(err)
        })
    })
  }

  getGeneralTokenInfo(){
    return new Promise((resolve, rejected) => {
      fetch(this.rpcUrl + '/tokenInfo', {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
      }).then((response) => {
        return response.json()
      })
        .then( (result) => {
          if(result.success){
            resolve(result.data)
          }else{
            rejected(new Error("Market data is not fetching"))
          }
        })
        .catch((err) => {
          rejected(err)
        })
    })
  }

  getVolumnChart(){
    return new Promise((resolve, rejected) => {
      fetch(BLOCKCHAIN_INFO[this.network].tracker + '/api/tokens/rates', {
      }).then((response) => {
        return response.json()
      })
        .then((result) => {
          resolve(result)
        })
        .catch((err) => {
          console.log(err)
          rejected(err)
        })
    })
  }

  getMarketInfo() {
    return new Promise((resolve, rejected) => {
      fetch(this.rpcUrl + '/marketInfo', {
      }).then((response) => {
        return response.json()
      })
        .then((result) => {
          resolve(result)
        })
        .catch((err) => {
          console.log(err)
          rejected(err)
        })
    })
  }

  getUserMaxCap(address) {
    return new Promise((resolve, rejected) => {
      fetch(BLOCKCHAIN_INFO[this.network].statEndPoint + '/users?address=' + address, {
      }).then((response) => {
        return resolve(response.json());
      }).catch((err) => {
        rejected(err)
      })
    })
  }

  calculateSourceAmountFromDestToken(srcSymbol, destSymbol, destAmount) {
    return new Promise((resolve, rejected) => {
      fetch(this.rpcUrl + `/sourceAmount?source=${srcSymbol}&dest=${destSymbol}&destAmount=${destAmount}`, {
      }).then((response) => {
        return resolve(response.json());
      }).catch((err) => {
        rejected(err)
      })
    })
  }
}
