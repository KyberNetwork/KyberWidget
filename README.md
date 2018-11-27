# KyberWidget
Payment button (widget) to allow users to pay for goods from tokens supported by Kyber, yet the merchants/ vendors can accept in whichever token they prefer.

## What does it do
The widget provides a friendly and convenient user interface for users to use ERC20 tokens to pay to an ETH address. Users can use different wallets of choice (for example, keystore, trezor, ledger, private key and metamask) to sign the transaction and make the payment, the widget will broadcast the transaction to the Ethereum network automatically and notify the app (vendors) about the transaction.

## How does it work
![How the widget works](https://github.com/KyberNetwork/KyberWidget/blob/master/assets/kyber_widget.png)

Above diagram shows how components like the widget, kyber network smart contract, vendor wallet, vendor servers interact to each other. Everything starts from end users.

**As a vendor, what you care are:**

1. How can you use (setup, install) the widget to specify which token you will receive to which wallet, the payment amount,..etc. [Read more](#how-to-use-the-widget)
2. How can you determine if a specific payment is pending, successful or failed (as the payment is failed to send, the payment is not sufficient or the payment is not in desired token). [Read more](#how-to-get-payment-status)

## How to get payment status
Vendor's backend server usually needs to monitor status of a payment in order to proceed to next step of an order (eg. sending confirmations to users, delivering the products, finalizing a deal...). With traditional payment gateways (Stripe, Paypal, Braintree...), vendors have to trust those gateways to send back the status, It is a bit different to KyberNetwork.

With KyberNetwork, the payment is made on blockchain thus vendors don't have to trust or rely on any data that comes from KyberNetwork but from the Ethereum network. However, vendors have to implement and run their own monitoring logic to get payment status from the Ethereum network or use and run the [libs](TODO) that KyberNetwork and the community have made.

### How to monitor the status
Before broadcasting the transaction, the widget will send all infos about the payment (depends on how vendors configure via its params, [read more](#how-to-use-the-widget)) including *transaction hash* to the `callback` ([read more](#how-to-use-the-widget)) passed to the widget. At this point, vendors' server is responsible to store that *transaction hash* and necessary payment infos (eg. user id, order id...) and use it to monitor that transaction's status on Ethereum network. Payment status will be determined based on that *transaction status* and the payment infos.

Basically, if the *transaction* is pending, payment is pending. If it is a reverted/failed tx, the payment is failed. If it is successful, the vendor needs to get the payment amount (in ETH or in ERC20 token) that the user sent and check if it is exactly the same to expected amount (price of a specific order).

There are 3 different transaction types the widget can broadcast.
1. Pay in ETH, vendors get ETH. It is just a basic ETH transfer transaction.
2. Pay in token A, vendors get token A. It is just a basic ERC20 transfer transaction.
3. Pay in token A, vendors get token B (B != A). It is a `trade()` transaction

In order to get the amount of token the user has sent, the vendor needs to see if the transaction is which type. Each type will have different way to get token amount sent by the user as following:
1. Transaction is the first type. Payment amount is transaction value.
2. Transaction is the second type. Payment amount is logged in `event Transfer(address indexed _from, address indexed _to, uint _value)`, in `_value` param.
3. Transaction is the third type. Payment amount is logged in `TradeExecute (index_topic_1 address origin, address src, uint256 srcAmount, address destToken, uint256 destAmount, address destAddress)`, in `destAmount` param.

**Pseudo code:**
```javascript
function paymentStatus(txhash, expectedPayment) -> return status {
  startTime = time.Now()
  txStatus = not_found
  loop {
    txStatus = getTxStatusFromEthereum(txhash) // possible returned value: not_found, pending, failed, success
    switch txStatus {
    case pending:
      // wait more, do nothing
      continue
    case failed:
      return "failed"
    case success:
      // TODO 
    case not_found:
      if time.Now() - startTime > 15 mins {
        // if the txhash is not found for more than 15 mins
        return "failed"
      }
    }
    
  } 
}
```
## How to use the widget
All you have to do is to place a button with proper url to your website.

Eg.
```
<a href="javascript:void(0);"
 NAME="KyberPay - Powered by KyberNetwork" title="Pay by tokens"
 onClick=window.open("https://developer.kyber.network/widget/payment?receiveAddr=0xFDF28Bf25779ED4cA74e958d54653260af604C20&receiveAmount=1.2&receiveToken=DAI&callback=https://yourwebsite.com/kybercallback&network=ropsten","Ratting","width=550,height=170,0,status=0");>Pay by tokens</a>
```

With that button, when a user click on it, a new window will pop up allowing him/her to do the payment. In this example, we *passed several params to the widget via its url*:

```
https://developer.kyber.network/widget/payment?receiveAddr=0xFDF28Bf25779ED4cA74e958d54653260af604C20&receiveAmount=1.2&receiveToken=DAI&callback=https://yourwebsite.com/kybercallback
```

that helps users to pay `1.2 DAI` equivalent amount of supported tokens (list of supported token will be given at the end of this Readme) to `0xFDF28Bf25779ED4cA74e958d54653260af604C20` (vendor's wallet), after the tx is broadcasted to the network, informations will be submitted to the callback url `https://yourwebsite.com/kybercallback`.

### Params to pass to the Widget
In this version, we only support the widget via a new browser windows thus we can pass params via its url as url query params.
The widget supports following params:
- ***receiveAddr*** (ethereum address with 0x prefix) - vendor's Ethereum wallet, user's payment will be sent there. *Must double check this param very carefully*. its value depend on field `type`
- ***receiveToken*** (string) - token that you (vendor) want to receive, it can be one of supported tokens (such as ETH, DAI, KNC...). If you leave it blank or missing, the users can specify it in the widget interface
- ***receiveAmount*** (float) - the amount of `receiveToken` you (vendor) want your user to pay. If you leave it blank or missing, the users can specify it in the widget interface. It could be useful for undetermined payment or pay-as-you-go payment like a charity, ICO or anything else.
- ***type*** (string) - default: `pay`. Possible value: `pay, swap, buy`. Indicate which app will behave. If value `pay`, Interface will become payment, `receiveAddr` is required. If value `swap`, Interface will be swap, `receiveAddr` must be blank, other cases will cause error. If value `buy`, Interface will be buy token, `receiveAddr` must be blank, `receiveToken` is required. 
- ***pinnedTokens*** (string) - default: "ETH_KNC_DAI". This param help to show priority tokens in list select token. 
- ***defaultPair*** (string) - default: "ETH_KNC". This param only take effect when `type=swap`, it indicates default token pair will show in swap layout. 
- ***callback*** (string) - missing or blank value will prevent the widget to call the callback, the information will not be informed anywhere. Params submit to callback are in `urlencoded` format.
- ***network*** (string) - default: `ropsten`, ethereum network that the widget will run. Possible value: `test, ropsten, production, mainnet`. `test` and `ropsten` will run on Ropsten network. `production, mainnet` will run on Mainnet ethereum. Be carefull for this param! 
- ***paramForwarding*** (bool) - default: `true`, if it is true, all params that were passed to the widget will be submitted via the `callback`. It is useful that you can give your user a secret token (ideally one time token) to pass to the callback just so you know the callback is not coming from a malicious actor.
- ***signer*** (string) - concatenation of a list of ethereum address by underscore `_`, eg. 0xFDF28Bf25779ED4cA74e958d54653260af604C20_0xFDF28Bf25779ED4cA74e958d54653260af604C20 - If you pass this param, the user will be forced to pay from one of those addresses.
- ***commissionId*** - Ethereum address - your Ethereum wallet to get commission of the fees for the transaction. Your wallet must be whitelisted by KyberNetwork (the permissionless registration will be available soon) in order to get the commission, otherwise it will be ignored.
- ***productName*** - String - Name of product
- ***productAvatar*** - String - Avatar of product
- ***paymentData*** - String - A piece of additional information attached to the payment after broadcasted on the blockchain (*Note: This param only takes effect when type=pay)
## Supported tokens
See all supported tokens [here](https://tracker.kyber.network/#/tokens)
