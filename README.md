# KyberWidget
Payment button (widget) to allow users to pay for monster in etheremon with tokens

## What does it do
The widget provides a friendly and convenient user interface for users to use ERC20 tokens to pay for monster in etheremon. Users can use different wallets of choice (for example, keystore, trezor, ledger, private key and metamask) to sign the transaction and make the payment, the widget will broadcast the transaction to the Ethereum network automatically and notify the app (vendors) about the transaction.

## How to use the widget
All you have to do is to place a button with proper url to your website.

Eg.
```
<a href="javascript:void(0);"
 NAME="KyberPay - Powered by KyberNetwork" title="Pay by tokens"
 onClick=window.open("https://widget-etheremon.knstats.com/widget/payment?etheremonAddr=0x11f9f4ce02f3a4e2ae37f8dedf23e882fd67b2c0&monsterId=106&monsterName=etheremon_pikachu&callback=https://yourwebsite.com/kybercallback&network=ropsten","Ratting","width=550,height=170,0,status=0");>Pay by tokens</a>
```

With that button, when a user click on it, a new window will pop up allowing him/her to do the payment. In this example, we *passed several params to the widget via its url*:

```
https://widget-etheremon.knstats.com/widget/payment?etheremonAddr=0x11f9f4ce02f3a4e2ae37f8dedf23e882fd67b2c0&monsterId=106&monsterName=etheremon_pikachuI&callback=https://yourwebsite.com/kybercallback
```


## Params to pass to the Widget
In this version, we only support the widget via a new browser windows thus we can pass params via its url as url query params.
The widget supports following params:
- ***etheremonAddr*** (etheremon address with 0x prefix) - **required** - Etheremon external payment Ethereum wallet. *Must double check this param very carefully*.
- ***monsterId*** (int) - **required** - Id of monster
- ***monsterName*** (float) - default: `Etheremon monster`, Name of monster
- ***callback*** (string) - missing or blank value will prevent the widget to call the callback, the information will not be informed anywhere.
- ***network*** (string) - default: `ropsten`, ethereum network that the widget will run. Possible value: `test, ropsten, production, mainnet`.
- ***paramForwarding*** (bool) - default: `true`, if it is true, all params that were passed to the widget will be submitted via the `callback`. It is useful that you can give your user a secret token (ideally one time token) to pass to the callback just so you know the callback is not coming from a malicious actor.
- ***signer*** (string) - concatenation of a list of ethereum address by underscore `_`, eg. 0xFDF28Bf25779ED4cA74e958d54653260af604C20_0xFDF28Bf25779ED4cA74e958d54653260af604C20 - If you pass this param, the user will be forced to pay from one of those addresses.
- ***commissionID*** - Ethereum address - your Ethereum wallet to get commission of the fees for the transaction. Your wallet must be whitelisted by KyberNetwork (the permissionless registration will be available soon) in order to get the commission, otherwise it will be ignored.

## Supported tokens
- OMG
- KNC
- SNT
- ELF
- POWR
- MANA
- BAT
- REQ
- GTO
- RDN
- APPC
- ENG
- SALT
- BQX
- ADX
- AST
- RCN
- ZIL
- DAI
- LINK
- IOST
- STORM
- MOT
- DGX
- ABT
- ENJ
- AION
- AE
- BLZ
- PAL
- ELEC
- BBO
- POLY
- LBA
- EDU
- CVC
- WAX
- SUB
- POE
- PAY
- CHAT
- DTA
- BNT
- TUSD
- TOMO
- MDS
- LEND
- WINGS
- MTL
- WABI
- ETH
