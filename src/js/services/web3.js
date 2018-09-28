import Web3 from "web3"


export default class Web3Service {
  constructor() {
   // alert(Web3.givenProvider)
    if (Web3.givenProvider) {
      this.web3 = new Web3(Web3.givenProvider)
    } else {
      this.web3 = null
    }

  }

  isHaveWeb3() {
    if (this.web3) {
      return true
    } else {
      return false
    }
  }
  
  isTrust = () => {
    if (this.web3.currentProvider && this.web3.currentProvider.isTrust === true){
      return true
    }
    return false
  }
  getNetworkId = () => {
    return new Promise((resolve, reject) => {
      this.web3.eth.net.getId((error, result) => {
        // alert(error)
        // alert(result)
        if (error || !result) {
          var error = new Error("Cannot get network id")
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  getWalletType = () => {
    if (this.web3.currentProvider && web3.currentProvider.isMetaMask){
      return "metamask"
    }

    if (this.web3.isDAppBrowser && this.web3.isDAppBrowser()){
      return "dapp"
    }

    if (this.web3.currentProvider && web3.currentProvider.isTrust === true){
      return "trust"
    }

    //is trust
    if (this.web3.currentProvider && web3.currentProvider.isTrust === true){
      return "trust"
    }

    //is cipher
    if((!!window.__CIPHER__) && (this.web3.currentProvider && this.web3.currentProvider.constructor && this.web3.currentProvider.constructor.name === "CipherProvider")){
      return "cipher"
    }

    return "unknown"
        
  }

  getCoinbase(){
    //alert("get_coinbase")
    return new Promise((resolve, reject)=>{
      // alert("get_coinbase")
      this.web3.eth.getCoinbase((error, result) => {
      //  alert(error)
      //  alert(result)
        if (error || !result) {
          var error = new Error("Cannot get coinbase")
          reject(error)
        }else{
          resolve(result)
        }
      })
    })
  }
  setDefaultAddress(address){
    this.web3.eth.defaultAccount = address
  }
}
