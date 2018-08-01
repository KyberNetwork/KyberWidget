# KyberWidget
Payment button (widget) to allow users to pay for goods from tokens supported by Kyber, yet the merchants/ vendors can accept in whichever token they prefer.

## What does it do
The widget provides a friendly and convenient user interface for users to use ERC20 tokens to pay to an ETH address. Users can use different wallets of choice (for example, keystore, trezor, ledger, private key and metamask) to sign the transaction and make the payment, the widget will broadcast the transaction to the Ethereum network automatically and notify the app (vendors) about the transaction.

## How does it work
![How the widget works](https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Untitled%20Diagram.xml#R5VlLc9s2EP41nCYHe%2FgQZfkoKXKdiZu49UyTHCESJFGBBAuCeuTXZ0GAFElQsmIraqf1wUMsFsDi2xd2ZXnzdPsrR3nyGwsxtVw73FreO8t1b0cT%2BC8JO0XwPUcRYk5CRWoRnsg3rIm2ppYkxEWHUTBGBcm7xIBlGQ5Eh4Y4Z5suW8Ro99QcxdggPAWImtTPJBSJok58e0%2B%2FxyRO6pMdW88sUbCKOSszfZ7lelH1p6ZTVO%2Bl%2BYsEhWzTInkLy5tzxoT6SrdzTCW0NWxq3d2B2UZujjNxygI5J1esES313f9cfHz36Q8tntjVkFSXwnKZbXmzTUIEfspRIGc3YANAS0RKYeTAZ0QonTPKOIwzlgHTbI25IIDwlJI4A7Jgcg3SI4ojkHcWoiKpzpCbaMlgHd4evJ7TgAa2iFmKBd8Bi17gjXy1ZFePNe6bvVZHtS6StkYnmoi0JcXN3ns04UMDegBc2wDXcscolRfPlkVe3dGePXyaf5jfT99%2F%2FG9i7l8UcgPxBbiia5cF5oWBL3hfLj%2FLlE4DIZFrIHtAS0wfWUEEYRKsJROCpcBA5cSscfMa8b2jH4K9pSpWCkoyPG%2Bil30e6J06fmroR46JvTcA%2FfgMyI8M5GeUBasgQSQDq6fS1JYcvmL59YZkUcmR5cK%2B9mq3xFx9wrEoRcVKjbBIQG0Byq6vr98a2oPzIR%2Fg5z3jDMj6k5vrrlnfmtA6Y3%2FArJ1zmLVvoPt7iSsB8VpewbUpi02YBZPwZpBhYK9oYD7BFQy7VG1CCpMnx1lIslhppCiDABdFVErpwPAhtyJCIXwYy0x1hZBi9ZBxkbCYZYgu9tRZN9y1FIi3RHyR5OvxZKLHXzUbCM53atKvh1%2F1ur%2BwEDv9ukAlgAGu15z8wKRbNvs%2FYk5AL5h33FEKfdxk4I6s5IHm0u8egXiMRcsxTMPimCJB1t3dX2MjEzOTg%2BYqHUHwW0sPe016%2BSlONBSgnKHkcI4IdXsQoL7tbhCloL7nbbpOIAHi4UUgHNndCO8NhKHJUHK1zwCgY5rYYyd02FAGgEnzoXggQ1Gftq7w%2F0WuPBnys4QRvxVEnCNBxP6BIPKygOGMzIhxe6GIMZCzFyqb9LUwmFx%2BhmqclmJauvjSDvb7ucur5lLB3DFVUysg74A%2B%2FruUteIsBSHhoeVNYdbOt%2FBfVReKflU9QeXcqDUHYUhc6WpAzgWAhkwT9Z57RWvV1wT9YLMzLDaMr6yqEBccBY3pwP2W%2FeVAy%2Fu0pEpPdf1fH%2BwcluFFt1eVTnP9Q3sXOcqMO%2FOBawwxDt3ugsL2q8p%2FA6myMY5C%2FObtD4HXCysnVbEMuCJatVJkIQyUCExSxwbH1eM7lBIqU%2Bc9pmssdz17hvbG3QzdZN5OoTCQom%2FPkaFvjLAxRxVHowe7qgnAX%2BUth9L0CmdFzXY0ZVessgyI5IYJIxA4%2F39JwjeThHOpLOF6xx5kWcR4iqr%2BhVl%2FCxl3ElQkqq5jPKwiOuxcjWW%2FpBoOV97neIPd9B9hJ1drR5R9PiVOjno5VKKur5tNJ6tV7%2FbISKWguirqBYymR1lvoaTSq%2FbGMeUc7VpsuWQoDp%2Fj9PpydWPu7pBcnv0q%2FtGoww8fSuLe6lp8FkUFFlbf%2BhvoT4t%2FZp%2Fkg3qr9B3gMwljfdw%2FWRJPnm0qDVZz5%2BgpOWMDq%2Ffy%2FVe94mxUtU0LmWPBL7YDNTIBCWVDKM%2FBS4cqPlXSyUzxptPWM1IOx9%2BY7v9R6bpcBZ3nU0kWTuWPPTAKKCoKEpxS79nWcMPnWCPpZWHFHUgN%2FrA5tBTuDyi8pr0y1Fx1rW3cbwoo4Y1IY%2BzT7%2FD7p0Ws5x0ahvvfvhT7%2FvdFb%2FEd)
## How to use the widget
All you have to do is to place a button with proper url to your website.

Eg.
```
<a href="javascript:void(0);"
 NAME="KyberPay - Powered by KyberNetwork"  title="Pay by tokens"
 onClick=window.open("https://developer.kyber.network/widget/payment?receiveAddr=0xFDF28Bf25779ED4cA74e958d54653260af604C20&receiveAmount=1.2&receiveToken=DAI&callback=https://yourwebsite.com/kybercallback&network=ropsten","Ratting","width=550,height=170,0,status=0");>Pay by tokens</a>
```

With that button, when a user click on it, a new window will pop up allowing him/her to do the payment. In this example, we *passed several params to the widget via its url*:

```
https://developer.kyber.network/widget/payment?receiveAddr=0xFDF28Bf25779ED4cA74e958d54653260af604C20&receiveAmount=1.2&receiveToken=DAI&callback=https://yourwebsite.com/kybercallback
```

that helps users to pay `1.2 DAI` equivalent amount of supported tokens (list of supported token will be given at the end of this Readme) to `0xFDF28Bf25779ED4cA74e958d54653260af604C20` (vendor's wallet), after the tx is broadcasted to the network, informations will be submitted to the callback url `https://yourwebsite.com/kybercallback`.

## Params to pass to the Widget
In this version, we only support the widget via a new browser windows thus we can pass params via its url as url query params.
The widget supports following params:
- ***receiveAddr*** (ethereum address with 0x prefix) - **required** - vendor's Ethereum wallet, user's payment will be sent there. *Must double check this param very carefully*.
- ***receiveToken*** (string) - **required** - token that you (vendor) want to receive, it can be one of supported tokens (such as ETH, DAI, KNC...).
- ***receiveAmount*** (float) - the amount of `receiveToken` you (vendor) want your user to pay. If you leave it blank or missing, the users can specify it in the widget interface. It could be useful for undetermined payment or pay-as-you-go payment like a charity, ICO or anything else.
- ***callback*** (string) - missing or blank value will prevent the widget to call the callback, the information will not be informed anywhere.
- ***network*** (string) - default: `ropsten`, ethereum network that the widget will run. Possible value: `test, ropsten, production, mainnet`.
- ***paramForwarding*** (bool) - default: `true`, if it is true, all params that were passed to the widget will be submitted via the `callback`. It is useful that you can give your user a secret token (ideally one time token) to pass to the callback just so you know the callback is not coming from a malicious actor.
- ***signer*** (string) - concatenation of a list of ethereum address by underscore `_`, eg. 0xFDF28Bf25779ED4cA74e958d54653260af604C20_0xFDF28Bf25779ED4cA74e958d54653260af604C20 - If you pass this param, the user will be forced to pay from one of those addresses.
- ***commissionID*** - Ethereum address - your Ethereum wallet to get commission of the fees for the transaction. Your wallet must be whitelisted by KyberNetwork (the permissionless registration will be available soon) in order to get the commission, otherwise it will be ignored.

## Supported tokens
See all supported tokens [here](https://tracker.kyber.network/#/tokens)
