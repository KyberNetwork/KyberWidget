Generalized widget integrating with Kyber

1. Usercase of Generalized widget:
  - Merchant has a smartcontract, which allow their users buy digital assets 
    (ERC20 tokens, Collectibles like Cryptokitties, Etheremon monsters,... ) through ETH. 
    Merchant wants to expand their payment method, in which their users can buy these assets by any ERC20 tokens (DAI, KNC,...).

2. Steps to setup a payment system to integrate with Kyber:
  - Create a wrapper contract 
    (That includes Converting from ERC20 to ETH by using Kyber contract and Use ETH to buy assets by using Merchant original contract)
    Please read developer.kyber.network for more detail.
  - Use Wapper Widget libraries to setup font-end to interact with wrapper contract. (Read section 3)

3. Developer need to provide params:
- appId: string, id of html tag, which redering widget.
- wrapper: string, address of smartcontract wrapper, which integrating with Kyber.
- getPrice: function, this function return a Promise, calculates a price of the asset by ETH and displays ETH price in widget.
            Example:
                function() { return new Promise((resolve, reject) => {resolve(productionPrice)}}

- getTxData: function, this function return a Promise, calculates txObject will send to blockchain.
            Example:
            function (sourceToken, sourceAmount, maxDestAmount, minConversionRate, walletId){
                var txObj ={
                    value:          [amount ETH will send to wrapper contract],
                    data:           [data will send to wrapper contract],
                    gasLimit:       [gas limit set for this transaction],
                    to:             [wrapper contract]
                }
                return new Promise((resolve, reject) => {resolve(txObj)}}
            }

- errors: Object{key => value}, list errors will display in widget (in case wrong parmas, network issues, etc.)

More detail about integrating with Wapper Widget library, please check examples at:
https://github.com/KyberNetwork/KyberWidget/tree/develop_wrapper/examples 