import Web3 from "web3"
import DappBrowser from "./DappBrowser";


export default class ModernMetamaskBrowser extends DappBrowser {
  constructor() {
    super()
    this.web3 = new Web3(Web3.givenProvider)
  }

  getWalletType = () => {
    return "metamask"
  }

  getNetworkId = () => {
    return new Promise((resolve, reject) => {
      this.web3.eth.net.getId((error, result) => {
        if (error || !result) {
          var error = new Error("Cannot get network id")
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  getCoinbase(isManual = false) {
    if (window.ethereum && isManual) {
      return new Promise((resolve, reject) => {
        window.ethereum.enable().then(() => {
          this.web3.eth.getCoinbase((error, result) => {
            if (error || !result) {
              var error = new Error("Cannot get coinbase")
              reject(error)
            } else {
              resolve(result)
            }
          })
        }).catch(err => {
          var error = new Error("Cannot get coinbase")
          reject(error)
        })
       
      })
    } else {
      return new Promise((resolve, reject) => {
        this.web3.eth.getCoinbase((error, result) => {
          if (error || !result) {
            var error = new Error("Cannot get coinbase")
            reject(error)
          } else {
            resolve(result)
          }
        })
      })
    }
  }

  setDefaultAddress(address) {
    this.web3.eth.defaultAccount = address
  }
  
}
