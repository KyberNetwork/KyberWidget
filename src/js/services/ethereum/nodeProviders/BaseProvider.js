import Web3 from "web3"
import constants from "../../constants"
import * as ethUtil from 'ethereumjs-util'
import BLOCKCHAIN_INFO from "../../../../../env"
import abiDecoder from "abi-decoder"
import EthereumTx from "ethereumjs-tx"
import * as converters from "../../../utils/converter"

export default class BaseProvider {
    // constructor(props) {
    //     super(props)
    //     this.network = props.network     
    // }
    
    initContract(network) {
        this.network = network
        
        this.rpc = new Web3(new Web3.providers.HttpProvider(this.rpcUrl, 3000))

        this.erc20Contract = new this.rpc.eth.Contract(constants.ERC20)
        this.networkAddress = BLOCKCHAIN_INFO[this.network].network        
        this.wrapperAddress = BLOCKCHAIN_INFO[this.network].wrapper
        this.payWrapperAddress = BLOCKCHAIN_INFO[this.network].payWrapper

        this.networkContract = new this.rpc.eth.Contract(constants.KYBER_NETWORK, this.networkAddress)
        this.wrapperContract = new this.rpc.eth.Contract(constants.KYBER_WRAPPER, this.wrapperAddress);
        this.payWrapperContract = new this.rpc.eth.Contract(constants.KYBER_PAY_WRAPPER, this.payWrapperAddress);
    }

    version() {
        return this.rpc.version.api
    }


    isConnectNode() {
        return new Promise((resolve, reject) => {
            this.rpc.eth.getBlock("latest", false).then((block) => {
                resolve(true)
            }).catch((errr) => {
                reject(false)
            })
        })
    }

    getLatestBlock() {
        return new Promise((resolve, reject) => {
            this.rpc.eth.getBlockNumber().then((block) => {
                resolve(block)
            }).catch((err) => {
                reject(err)
            })
        })
    }

    getBalanceAtLatestBlock(address) {
        return new Promise((resolve, reject) => {
            this.rpc.eth.getBalance(address)
                .then((balance) => {
                    if (balance != null) {
                        resolve(balance)
                    }
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    getAllBalancesTokenAtLatestBlock(address, tokens) {
        var listToken = []
        var listSymbol = []
        Object.keys(tokens).map(index => {
            var token = tokens[index]
            listToken.push(token.address)
            listSymbol.push(token.symbol)
        })

        return new Promise((resolve, reject) => {
            var data = this.wrapperContract.methods.getBalances(address, listToken).call().then(result => {
                //console.log(result)
                var listTokenBalances = []
                listSymbol.map((symbol, index) => {
                    listTokenBalances.push({
                        symbol: symbol,
                        balance: result[index] ? result[index]: "0"
                    })
                })
                resolve(listTokenBalances)
            }).catch(err => {
                console.log(err)
                reject(err)
            })
        })
    }



    getAllBalancesTokenAtSpecificBlock(address, tokens, blockno) {
        var promises = Object.keys(tokens).map(index => {
            var token = tokens[index]
            if (token.symbol === 'ETH') {
                return new Promise((resolve, reject) => {
                    this.getBalanceAtSpecificBlock(address, blockno).then(result => {
                        resolve({
                            symbol: 'ETH',
                            balance: result
                        })
                    }).catch(err => {
                        reject(new Error("Cannot get balance of ETH"))
                    })
                })

            } else {
                return new Promise((resolve, reject) => {
                    this.getTokenBalanceAtSpecificBlock(token.address, address, blockno).then(result => {
                        resolve({
                            symbol: token.symbol,
                            balance: result
                        })
                    }).catch(err => {
                        reject(new Error("Cannot get balance of " + token.symbol))
                    })
                })
            }
        })
        return Promise.all(promises)
    }

    getMaxCapAtLatestBlock(address) {
        var data = this.networkContract.methods.getUserCapInWei(address).encodeABI()
        return new Promise((resolve, reject) => {
            this.rpc.eth.call({
                to: BLOCKCHAIN_INFO[this.network].network,
                data: data
            })
                .then(result => {
                    var cap = this.rpc.eth.abi.decodeParameters(['uint256'], result)
                    resolve(cap[0])
                }).catch((err) => {
                    reject(err)
                })
        })
    }

    getNonce(address) {
        return new Promise((resolve, reject) => {
            this.rpc.eth.getTransactionCount(address)
                .then((nonce) => {
                    resolve(nonce)
                })
                .catch((err) => {
                    reject(err)
                })
        })


    }

    getTokenBalanceAtLatestBlock(address, ownerAddr) {
        var instance = this.erc20Contract
        instance.options.address = address

        var data = instance.methods.balanceOf(ownerAddr).encodeABI()

        return new Promise((resolve, reject) => {
            this.rpc.eth.call({
                to: address,
                data: data
            })
                .then(result => {
                    var balance = this.rpc.eth.abi.decodeParameters(['uint256'], result)
                    resolve(balance[0])
                }).catch((err) => {
                    // console.log(err)
                    reject(err)
                })
        })
    }

    estimateGas(txObj) {
        return new Promise((resolve, reject) => {
            this.rpc.eth.estimateGas(txObj)
                .then((result) => {
                   // console.log("gas_result: " + result)
                    if (result != null) {
                        resolve(result)
                    }
                })
                .catch((err) => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    exchangeData(sourceToken, sourceAmount, destToken, destAddress,
        maxDestAmount, minConversionRate, walletId, commisionFee) {

        if (!this.rpc.utils.isAddress(walletId)) {
            walletId = "0x" + Array(41).join("0")
        }
        var hint = this.rpc.utils.utf8ToHex("")

        var data = this.networkContract.methods.tradeWithHintAndFee(
            sourceToken, sourceAmount, destToken, destAddress,
            maxDestAmount, minConversionRate, walletId, commisionFee,  hint).encodeABI()

        return new Promise((resolve, reject) => {
            resolve(data)
        })
    }

    approveTokenData(sourceToken, sourceAmount, isPayMode = false) {
        var tokenContract = this.erc20Contract;
        const spender = isPayMode ? this.payWrapperAddress : this.networkAddress;

        tokenContract.options.address = sourceToken

        var data = tokenContract.methods.approve(spender, sourceAmount).encodeABI()
        return new Promise((resolve, reject) => {
            resolve(data)
        })
    }

    sendTokenData(sourceToken, sourceAmount, destAddress) {
        var tokenContract = this.erc20Contract
        tokenContract.options.address = sourceToken
        var data = tokenContract.methods.transfer(destAddress, sourceAmount).encodeABI()
        return new Promise((resolve, reject) => {
            resolve(data)
        })
    }

    getAllowanceAtLatestBlock(sourceToken, owner, isPayMode = false) {
        var tokenContract = this.erc20Contract;
        const spender = isPayMode ? this.payWrapperAddress : this.networkAddress;

        tokenContract.options.address = sourceToken

        var data = tokenContract.methods.allowance(owner, spender).encodeABI()

        return new Promise((resolve, reject) => {
            this.rpc.eth.call({
                to: sourceToken,
                data: data
            })
                .then(result => {
                    var allowance = this.rpc.eth.abi.decodeParameters(['uint256'], result)
                    resolve(allowance[0])
                }).catch((err) => {
                    reject(err)
                })
        })
    }

  getPaymentEncodedData(sourceToken, sourceAmount, destToken, destAddress,
                        maxDestAmount, minConversionRate, walletId, paymentData, hint) {
                            
    if (!this.rpc.utils.isAddress(walletId)) {
      walletId = "0x" + Array(41).join("0")
    }

    console.log({sourceToken, sourceAmount, destToken, destAddress,
        maxDestAmount, minConversionRate, walletId, paymentData, hint})

    hint = this.rpc.utils.utf8ToHex(constants.PERM_HINT)

    const data = this.payWrapperContract.methods.pay(
      sourceToken, sourceAmount, destToken, destAddress, maxDestAmount,
      minConversionRate, walletId, paymentData, hint, BLOCKCHAIN_INFO[this.network].old_network
    ).encodeABI();

    return new Promise((resolve) => {
      resolve(data);
    });
  }

    getDecimalsOfToken(token) {
        var tokenContract = this.erc20Contract
        tokenContract.options.address = token
        return new Promise((resolve, reject) => {
            tokenContract.methods.decimals().call().then((result) => {
                resolve(result)
            }).catch(err => {
                reject(err)
            })
        })
    }

    txMined(hash) {
        return new Promise((resolve, reject) => {
            this.rpc.eth.getTransactionReceipt(hash).then((result) => {
                resolve(result)
            }).catch(err => {
                reject(err)
            })
        })

    }

    getRate(source, dest, srcAmount) {
        return new Promise((resolve, reject) => {
            this.networkContract.methods.getExpectedRate(source, dest, srcAmount).call()
                .then((result) => {
                    if (result != null) {
                        resolve(result)
                    }
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    // getRateTest(source, dest, quantity) {
    //     return new Promise((resolve, reject) => {
    //         this.networkContract.methods.getExpectedRate(source, dest, quantity).call()
    //             .then((result) => {
    //                 if (result != null) {
    //                    // resolve(result)
    //                 }
    //             })
    //             .catch((err) => {
    //                 reject(err)
    //             })
    //     })
    // }

    checkKyberEnable() {
        return new Promise((resolve, reject) => {
            this.networkContract.methods.enabled().call()
                .then((result) => {
                    resolve(result)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    getTxHash(tx) {
        return new Promise((resolve, rejected) => {
            // var hex = tx.serialize()
            // console.log(hex)
            var hash = new EthereumTx(tx.serialize()).hash()
            resolve(ethUtil.bufferToHex(hash))
        })
               //return ethUtil.bufferToHex(tx.serialize())
    }

    sendRawTransaction(tx) {
        return new Promise((resolve, rejected) => {
            this.rpc.eth.sendSignedTransaction(
                ethUtil.bufferToHex(tx.serialize()), (error, hash) => {
                    if (error != null) {
                        rejected(error)
                    } else {
                        resolve(hash)
                    }
                })
        })
    }

    tokenIsSupported(address) {
        let tokens = BLOCKCHAIN_INFO[this.network].tokens
        for (let token in tokens) {
            if (tokens[token].address.toLowerCase() == address.toLowerCase()) {
                return true
            }
        }
        return false
    }

    getAllRate(sources, dests, quantity) {
        var dataAbi = this.wrapperContract.methods.getExpectedRates(this.networkAddress, sources, dests, quantity).encodeABI()

        return new Promise((resolve, reject) => {
            this.rpc.eth.call({
                to: this.wrapperAddress,
                data: dataAbi
            })
                .then((data) => {
                   //console.log(data)
                    try {
                        var dataMapped = this.rpc.eth.abi.decodeParameters([
                            {
                                type: 'uint256[]',
                                name: 'expectedPrice'
                            },
                            {
                                type: 'uint256[]',
                                name: 'slippagePrice'
                            }
                        ], data)
                        resolve(dataMapped)
                    } catch (e) {
                        reject(err)
                    }
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    getAllRates(tokensObj) {
        var arrayTokenAddress = Object.keys(tokensObj).map((tokenName) => {
            return tokensObj[tokenName].address
        });

        var arrayEthAddress = Array(arrayTokenAddress.length).fill(constants.ETH.address)

        var mask = converters.maskNumber()
        var arrayQty = Array(arrayTokenAddress.length * 2).fill(mask)

        return this.getAllRate(arrayTokenAddress.concat(arrayEthAddress), arrayEthAddress.concat(arrayTokenAddress), arrayQty).then((result) => {
            var returnData = []
            Object.keys(tokensObj).map((tokenSymbol, i) => {
                returnData.push({
                    source: tokenSymbol,
                    dest: "ETH",
                    rate: result.expectedPrice[i],
                    minRate: result.slippagePrice[i]
                })

                returnData.push({
                    source: "ETH",
                    dest: tokenSymbol,
                    rate: result.expectedPrice[i + arrayTokenAddress.length],
                    minRate: result.slippagePrice[i + arrayTokenAddress.length]
                })
            });
            return returnData
        })
    }

    getMaxGasPrice() {
        return new Promise((resolve, reject) => {
            this.networkContract.methods.maxGasPrice().call()
                .then((result) => {
                    if (result != null) {
                        resolve(result)
                    }
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    //--------------------------For debug tx functions
    getTx(txHash) {
        return new Promise((resolve, rejected) => {
            this.rpc.eth.getTransaction(txHash).then((result) => {
                if (result != null) {
                    resolve(result)
                } else {
                    rejected(new Error("Cannot get tx hash"))
                }
            })
        })
    }    

    getAbiByName(name, abi) {
        for (var value of abi) {
            if (value.name === name) {
                return [value]
            }
        }
        return false
    }

    extractExchangeEventData(data) {
        return new Promise((resolve, rejected) => {
            try {
                const { src, dest, srcAmount, destAmount } = this.rpc.eth.abi.decodeParameters([{
                    type: "address",
                    name: "src"
                }, {
                    type: "address",
                    name: "dest"
                }, {
                    type: "uint256",
                    name: "srcAmount"
                }, {
                    type: "uint256",
                    name: "destAmount"
                }], data)
                resolve({ src, dest, srcAmount, destAmount })
            } catch (e) {
                reject(e)
            }

        })
    }


    exactTradeData(data) {
        return new Promise((resolve, reject) => {
            try {
                //get trade abi from 
                var tradeAbi = this.getAbiByName("trade", constants.KYBER_NETWORK)
                //  console.log(tradeAbi)
                abiDecoder.addABI(tradeAbi)
                //  console.log(abiDecoder)
                var decoded = abiDecoder.decodeMethod(data);
                //      console.log(decoded)
                resolve(decoded.params)
            } catch (e) {
                reject(e)
            }

        })
    }


    //************************ API for prune MODE *******************/
    //*****
    //************* */
    getBalanceAtSpecificBlock(address, blockno) {
        return new Promise((resolve, reject) => {
            this.rpc.eth.getBalance(address, blockno)
                .then((balance) => {
                    resolve(balance)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    getMaxCapAtSpecificBlock(address, blockno) {
        var data = this.networkContract.methods.getUserCapInWei(address).encodeABI()
        return new Promise((resolve, reject) => {
            this.rpc.eth.call({
                to: BLOCKCHAIN_INFO[this.network].network,
                data: data
            }, blockno)
                .then(result => {
                    var cap = this.rpc.eth.abi.decodeParameters(['uint256'], result)
                    resolve(cap[0])
                }).catch((err) => {
                    reject(err)
                })
        })
    }


    getTokenBalanceAtSpecificBlock(address, ownerAddr, blockno) {
        var instance = this.erc20Contract
        instance.options.address = address

        var data = instance.methods.balanceOf(ownerAddr).encodeABI()

        return new Promise((resolve, reject) => {
            this.rpc.eth.call({
                to: address,
                data: data
            }, blockno)
                .then(result => {
                    var balance = this.rpc.eth.abi.decodeParameters(['uint256'], result)
                    resolve(balance[0])
                }).catch((err) => {
                    reject(err)
                })
        })
    }

    getGasPrice() {
        return new Promise((resolve, reject) => {
            this.rpc.eth.getGasPrice()
                .then(result => {
                    // console.log("gas price")
                    // console.log(result)

                    var gasPrice = parseInt(result, 10)
                    gasPrice = gasPrice / 1000000000
                    if (gasPrice < 1) {
                        resolve({
                            low: 1,
                            default: 1,
                            standard: 1,
                            fast: 1
                        })
                    } else {
                        gasPrice = Math.round(gasPrice * 10) / 10
                        resolve({
                            low: gasPrice.toString(),
                            default: gasPrice.toString(),
                            standard: gasPrice.toString(),
                            fast: (gasPrice * 1.3).toString()
                        })
                    }

                }).catch((err) => {
                    reject(err)
                })
        })
    }

    getAllowanceAtSpecificBlock(sourceToken, owner, blockno) {
        var tokenContract = this.erc20Contract
        tokenContract.options.address = sourceToken

        var data = tokenContract.methods.allowance(owner, this.networkAddress).encodeABI()

        return new Promise((resolve, reject) => {
            this.rpc.eth.call({
                to: sourceToken,
                data: data
            }, blockno)
                .then(result => {
                    var allowance = this.rpc.eth.abi.decodeParameters(['uint256'], result)
                    resolve(allowance[0])
                }).catch((err) => {
                    reject(err)
                })
        })
    }

    wrapperGetGasCap(blockno) {
        return new Promise((resolve, reject) => {
            var data = this.networkContract.methods.maxGasPrice().encodeABI()
            this.rpc.eth.call({
                to: BLOCKCHAIN_INFO[this.network].network,
                data: data
            }, blockno)
                .then(result => {
                    var gasCap = this.rpc.eth.abi.decodeParameters(['uint256'], result)
                    resolve(gasCap[0])
                }).catch((err) => {
                    reject(err)
                })
        })
    }

    getRateAtSpecificBlock(source, dest, srcAmount, blockno) {
        var data = this.networkContract.methods.getExpectedRate(source, dest, srcAmount).encodeABI()

        return new Promise((resolve, reject) => {
            this.rpc.eth.call({
                to: BLOCKCHAIN_INFO[this.network].network,
                data: data
            }, blockno)
                .then(result => {
                    if (result === "0x") {
                        reject(new Error("Cannot get rate"))
                        return
                    }
                    try {
                        var rates = this.rpc.eth.abi.decodeParameters([{
                            type: 'uint256',
                            name: 'expectedPrice'
                        }, {
                            type: 'uint256',
                            name: 'slippagePrice'
                        }], result)
                        resolve(rates)
                    } catch (e) {
                        reject(e)
                    }
                }).catch((err) => {
                    reject(err)
                })
        })
    }

    wrapperGetReasons(reserve, input, blockno) {
        return new Promise((resolve) => {
            resolve("Cannot get rate at the moment!")
        })
    }
    wrapperGetChosenReserve(input, blockno) {
        return new Promise((resolve) => {
            resolve(BLOCKCHAIN_INFO[this.network].reserve)
        })
    }
}
