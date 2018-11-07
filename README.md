# Dapp widget

## 1. Usercase of Dapp widget:
  - Merchant has a smartcontract, which allow their users buy digital assets 
    (ERC20 tokens, Collectibles like Cryptokitties, Etheremon monsters,... ) through ETH. 
    Merchant wants to expand their payment method, in which their users can buy these assets by any ERC20 tokens (DAI, KNC,...).
    
## 2. Steps to setup a payment system to integrate with Kyber:
  - Create a wrapper contract 
    (That includes Converting from ERC20 to ETH by using Kyber contract and Use ETH to buy assets by using Merchant original contract)
    Please read developer.kyber.network for more detail.
  - Use Wapper Widget libraries to setup font-end to interact with wrapper contract. (Read section 3)
  
## 3. Params to pass to the Widget
- ***appId*** (string) - **required** - Id of html tag, which redering widget.
- ***wrapper*** (string) - **required** - Address of smartcontract wrapper, which integrating with Kyber.
- ***getPrice*** (function): This function return a Promise, calculates a price of the asset by ETH and displays ETH price in widget. Example: 
            ```
            
            function() { 
            
              return new Promise((resolve, reject) => {resolve(productionPrice)}
              
            }
           
- ***getTxData*** (function) - This function return a Promise, calculates txObject will send to blockchain. Example:
            ```
            
             function (sourceToken, sourceAmount, maxDestAmount, minConversionRate, walletId){
             
                var txObj ={
                
                    value:          [amount ETH will send to wrapper contract],
                    
                    data:           [data will send to wrapper contract],
                    
                    gasLimit:       [gas limit set for this transaction],
                    
                    to:             [wrapper contract]
                    
                }
                
                return new Promise((resolve, reject) => {resolve(txObj)}}
                
            }
     
- ***errors*** (Object{key => value}) - List errors will display in widget (in case wrong parmas, network issues, etc.)
- ***params*** (string) - List of optional param with purpose as below:    
      - pinnedTokens (string) - default: "ETH_KNC_DAI". This param help to show priority tokens in list select token.
      
      - network (string) - default: `ropsten`, ethereum network that the widget will run. Possible value: `test,    ropsten, production, mainnet`.
      
      - paramForwarding (bool) - default: `true`, if it is true, all params that were passed to the widget will be submitted via the `callback`. It is useful that you can give your user a secret token (ideally one time token) to pass to the callback just so you know the callback is not coming from a malicious actor.
      
      - signer (string) - concatenation of a list of ethereum address by underscore `_`, eg. 0xFDF28Bf25779ED4cA74e958d54653260af604C20_0xFDF28Bf25779ED4cA74e958d54653260af604C20 - If you pass this param, the user will be forced to pay from one of those addresses.
      
      - commissionID (string) - Ethereum address - your Ethereum wallet to get commission of the fees for the transaction. Your wallet must be whitelisted by KyberNetwork (the permissionless registration will be available soon) in order to get the commission, otherwise it will be ignored.
      
      - disabledTokens (string) - List tokens will be not appeared in widget. For example: ```BBO_TOMO```
      
      - productName (string) - Name of product
      
      - productAvatar (url/ base64 image) - Avatar of product
      
      - productId (string) - Id of product

## 4. Examples of integration:
   - ***Daonomic***: 
   
       +) Source code: https://github.com/KyberNetwork/KyberWidget/blob/master_wrapper/dapps/daonomic/index.html
       
       +) Live demo: https://widget.kyber.network/dapps/daonomic/
               
   - ***Etheremon***: 
   
       +) Source code: https://github.com/KyberNetwork/KyberWidget/tree/master_wrapper/dapps/etheremon
       
       +) Live demo: https://widget.kyber.network/dapps/etheremon/?network=rinkeby&productId=105
   
   

