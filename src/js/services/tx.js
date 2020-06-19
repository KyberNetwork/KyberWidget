export default class Tx {
  constructor(
    hash, from, gas, gasPrice, nonce, status = "pending",
    type, data, address) {
    this.hash = hash
    this.from = from
    this.gas = gas
    this.gasPrice = gasPrice
    this.nonce = nonce
    this.status = status
    this.type = type
    this.data = data // data can be used to store wallet name
    this.address = address
    this.threw = false
    this.error = null
    this.errorInfo = null
    this.eventTrade = null
    this.blockNumber = null
  }

  shallowClone() {
    return new Tx(
      this.hash, this.from, this.gas, this.gasPrice, this.nonce,
      this.status, this.type, this.data, this.address, this.threw,
      this.error, this.errorInfo, this.recap, this.eventTrade, this.blockNumber)
  }
}
