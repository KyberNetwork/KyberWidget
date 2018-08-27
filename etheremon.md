# KyberWidget for Etheremon
KyberWidget for Etheremon allow users to pay for catchable monsters from any of tokens supported by Kyber.

## Demo

A simple demo is available at https://widget.knstats.com/etheremon/. If you specify `https://kyberpay-sample.knstats.com/callback` as `callback URL`, you could go to https://kyberpay-sample.knstats.com/list to see postback transaction list.

## How to use the widget

### Include widget's CSS and javascript

Add following `link` tag to `head` section of your HTML. This is just standard CSS and could be tweaked if desired.

```
<link rel="stylesheet" href="https://widget.knstats.com/v1.0/widget.css">
```
Add following `script` tag to the end of `body` tag.
```
<script data-edition="etheremon" async src="https://widget.knstats.com/v1.0/widget.js"></script>
```

Make sure to include `data-edition="etheremon"` attribute as above.

### Add the buttons with proper URLs

Eg.
```
<a class="kyber-widget-button" target="_blank"
 href="https://widget-etheremon.knstats.com/?mode=dom&etheremonAddr=0x11f9f4ce02f3a4e2ae37f8dedf23e882fd67b2c0&monsterId=106&monsterName=Ikopi&monsterAvatar=https%3A%2F%2Fwww.etheremon.com%2F325db34365c36c186fd2217ace32591c.png"
 name="KyberWidget - Powered by KyberNetwork" title="Buy with tokens">Buy</a>
```
Button's title and text can be changed if desired. You could add multiple buttons into a page.

The widget supports 3 modes, which you specify by setting `mode` param of the button's `href`.
- New tab (default): The widget will open in new browser tab.
- Popup (`mode=dom`): the widget will open as an overlay popup. The widget will be inserted directly into the host page's DOM. Use this method if you prefer its UI, or you want to customize the widget appearance by overiding CSS rules.
- iFrame (`mode=iframe`): the widget will open inside an iFrame on an overlay popup. Use this mode if you prefer its UI and don't want to overide widget's CSS.

### Params to pass to the Widget
- ***etheremonAddr*** (ethereum address with 0x prefix) - **required** - Ethermon address. For ropsten, it is `0x11f9f4ce02f3a4e2ae37f8dedf23e882fd67b2c0`.
- ***monsterId*** (int) - **required** - The monster ID. E.g. `106`.
- ***monsterName*** (string) - The monster name. E.g. `Ikopi`
- ***monsterAvatar*** (string) - The monster avatar. E.g. `https://www.etheremon.com/325db34365c36c186fd2217ace32591c.png`
- ***callback*** (string) - Once transaction is broadcasted successfuly, the widget will make a `POST` request to the callback with content type of `text/plain`. The content is in JSON format, e.g.
```
{
  tx: '0x28542e96c40930f052b3750f15b53703af126974e2b14b52377b25f503bad515',
  network: 'ropsten'
}
```
- ***network*** (string) - default: `ropsten`, ethereum network that the widget will run. Possible value: `test, ropsten, production, mainnet`.
- ***paramForwarding*** (bool) - default: `true`, if it is true, all params that were passed to the widget will be submitted via the `callback`. It is useful that you can give your user a secret token (ideally one time token) to pass to the callback just so you know the callback is not coming from a malicious actor.
- ***signer*** (string) - concatenation of a list of ethereum address by underscore `_`, eg. 0xFDF28Bf25779ED4cA74e958d54653260af604C20_0xFDF28Bf25779ED4cA74e958d54653260af604C20 - If you pass this param, the user will be forced to pay from one of those addresses.
- ***commissionId*** - Ethereum address - your Ethereum wallet to get commission of the fees for the transaction. Your wallet must be whitelisted by KyberNetwork (the permissionless registration will be available soon) in order to get the commission, otherwise it will be ignored.

## Supported tokens
See all supported tokens [here](https://tracker.kyber.network/#/tokens). Note that `EOS` was delisted and then not supported.
