import * as common from "../../utils/common"

export default class Mixpanel {
  initService(network) {
    if (typeof mixpanel !== "undefined") {
      mixpanel = undefined
    }

    if (network === 'mainnet' || network === 'production') {
      (function (e, a) {
        if (!a.__SV) {
          var b = window; try { var c, l, i, j = b.location, g = j.hash; c = function (a, b) { return (l = a.match(RegExp(b + "=([^&]*)"))) ? l[1] : null }; g && c(g, "state") && (i = JSON.parse(decodeURIComponent(c(g, "state"))), "mpeditor" === i.action && (b.sessionStorage.setItem("_mpcehash", g), history.replaceState(i.desiredHash || "", e.title, j.pathname + j.search))) } catch (m) { } var k, h; window.mixpanel = a; a._i = []; a.init = function (b, c, f) {
            function e(b, a) {
              var c = a.split("."); 2 == c.length && (b = b[c[0]], a = c[1]); b[a] = function () {
                b.push([a].concat(Array.prototype.slice.call(arguments,
                  0)))
              }
            } var d = a; "undefined" !== typeof f ? d = a[f] = [] : f = "mixpanel"; d.people = d.people || []; d.toString = function (b) { var a = "mixpanel"; "mixpanel" !== f && (a += "." + f); b || (a += " (stub)"); return a }; d.people.toString = function () { return d.toString(1) + ".people (stub)" }; k = "disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
            for (h = 0; h < k.length; h++)e(d, k[h]); a._i.push([b, c, f])
          }; a.__SV = 1.2; b = e.createElement("script"); b.type = "text/javascript"; b.async = !0; b.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "file:" === e.location.protocol && "//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//) ? "https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js" : "//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js"; c = e.getElementsByTagName("script")[0]; c.parentNode.insertBefore(b, c)
        }
      })(document, window.mixpanel || []);
      mixpanel.init("c8ba82217c67ca61811d0174de5fd51f");
    } else {
      (function (e, a) {
        if (!a.__SV) {
          var b = window; try { var c, l, i, j = b.location, g = j.hash; c = function (a, b) { return (l = a.match(RegExp(b + "=([^&]*)"))) ? l[1] : null }; g && c(g, "state") && (i = JSON.parse(decodeURIComponent(c(g, "state"))), "mpeditor" === i.action && (b.sessionStorage.setItem("_mpcehash", g), history.replaceState(i.desiredHash || "", e.title, j.pathname + j.search))) } catch (m) { } var k, h; window.mixpanel = a; a._i = []; a.init = function (b, c, f) {
            function e(b, a) {
              var c = a.split("."); 2 == c.length && (b = b[c[0]], a = c[1]); b[a] = function () {
                b.push([a].concat(Array.prototype.slice.call(arguments,
                  0)))
              }
            } var d = a; "undefined" !== typeof f ? d = a[f] = [] : f = "mixpanel"; d.people = d.people || []; d.toString = function (b) { var a = "mixpanel"; "mixpanel" !== f && (a += "." + f); b || (a += " (stub)"); return a }; d.people.toString = function () { return d.toString(1) + ".people (stub)" }; k = "disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
            for (h = 0; h < k.length; h++)e(d, k[h]); a._i.push([b, c, f])
          }; a.__SV = 1.2; b = e.createElement("script"); b.type = "text/javascript"; b.async = !0; b.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "file:" === e.location.protocol && "//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//) ? "https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js" : "//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js"; c = e.getElementsByTagName("script")[0]; c.parentNode.insertBefore(b, c)
        }
      })(document, window.mixpanel || []);
      mixpanel.init("9c78999aea94c92497693a5a0c7e6890");
    }
    this.addUserIdentity()
  }

  addUserIdentity() {
    if (typeof mixpanel === "undefined") return;

    var userCookies = common.getCookie("mixpanel_user_cookies")
    if (!userCookies) {
      userCookies = Math.random().toString(36).slice(2)
      common.setCookie("mixpanel_user_cookies", userCookies)
    }

    mixpanel.identify(userCookies);
    mixpanel.people.set_once({
      "$distinct_id": userCookies,
      "$name": userCookies
    });
  }

  acceptTerm(value) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_1_Click_AcceptTerm", { value: value })
      } catch (e) {
        console.log(e)
      }
    }
  }

  loginWallet(wallet) {
    if (wallet === "keystore") wallet = "json"
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_Login_Wallet", { wallet: wallet })
      } catch (e) {
        console.log(e)
      }
    }
  }

  typeMount() {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_1_Click_Input_Amount")
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickTokenSelector(isOpen) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_1_Click_Token_Selector", {isOpen: isOpen})
      } catch (e) {
        console.log(e)
      }
    }
  }

  chooseToken(token, type) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_2_Click_Choose_Token", { token: token, type: type })
      } catch (e) {
        console.log(e)
      }
    }
  }

  chooseSuggestToken(token, type) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_2_Click_Choose_Suggest_Token", { token: token, type: type })
      } catch (e) {
        console.log(e)
      }
    }
  }

  searchToken(type) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_2_Click_Search_Token", { type: type })
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickToAdvance(status) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_1_Click_To_Advance", { status: status })
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickToNext(step) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_2_Click_Next")
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickToBack(step) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_*_1_Click_Back", { step: step })
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickToConfirm(sourceToken, destToken) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_3_1_Click_Confirm_Transaction", { sourceToken: sourceToken, destToken: destToken })
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickToApprove(token) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_3_1_Click_Approve_Token", { token: token })
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickShowPassword() {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_2_2_Click_Show_Password")
      } catch (e) {
        console.log(e)
      }
    }
  }

  completeTransaction(sourceToken, destToken) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_Complete_Transaction", { sourceToken: sourceToken, destToken: destToken })
      } catch (e) {
        console.log(e)
      }
    }
  }

  viewTxOnEtherscan() {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_4_1_Click_View_Transaction_On_Etherscan")
      } catch (e) {
        console.log(e)
      }
    }
  }

  copyTx() {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_4_1_Click_Copy_Tx")
      } catch (e) {
        console.log(e)
      }
    }
  }

  backToWebsite() {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_*_1_Click_Back_To_Website")
      } catch (e) {
        console.log(e)
      }
    }
  }

  setNewMinRate(minRate) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_2_Click_Set_New_MinRate", { minRate: minRate })
      } catch (e) {
        console.log(e)
      }
    }
  }

  customNewGas() {
    console.log("input new gas")
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_2_Click_To_Custom_Gas")
      } catch (e) {
        console.log(e)
      }
    }
  }

  chooseGas(type, gasPrice) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_3_Click_To_Choose_Gas", { type: type, gasPrice: gasPrice })
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickToImportAccount(walletType) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_2_1_Click_To_Import_Account", { walletType: walletType })
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickFocusToInputPrivateKey() {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_2_3_Click_To_Input_PrivateKey")
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickTermAndCondition() {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_1_1_Click_To_Term_And_Codition")
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickFocusToInputJSONPws() {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_3_1_Click_To_Input_Password")
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickBackToImportScreen() {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_2_2_Click_Back_To_Import_Wallet_Screen")
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickChooseNewPathColdWallet(path, walletType) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_2_3_Click_Choose_New_Path_Cold_Wallet", {path: path, walletType: walletType})
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickFocusToInPutNewPathColdWallet(walletType) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_2_3_Click_Input_New_Path_Cold_Wallet", {walletType: walletType})
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickPathSelectorColdWallet(walletType, isOpen) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_2_2_Click_Path_Selector_Cold_Wallet", {walletType: walletType, isOpen: isOpen})
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickAddressSelectorColdWallet(walletType, isOpen) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_2_2_Click_Address_Selector_Cold_Wallet", {walletType: walletType, isOpen: isOpen})
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickChooseNewAddressColdWallet(address, walletType) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_2_3_Click_Choose_New_Address_Cold_Wallet", {address: address, walletType: walletType})
      } catch (e) {
        console.log(e)
      }
    }
  }

  clickNavigateAddressColdWallet(direction) {
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Widget_2_3_Click_Navigate_Address_Cold_Wallet", {direction: direction})
      } catch (e) {
        console.log(e)
      }
    }
  }

  trackAccessToWidget(){
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function') {
      try {
        mixpanel.track("Session_Widget_Start")
      } catch (e) {
        console.log(e)
      }
    }
  }
  exitWidget(){
    if (typeof mixpanel !== "undefined" && typeof mixpanel.track === 'function'){
      try{
        mixpanel.track("Session_Widget_End")
      }catch(e){
        console.log(e)
      }
    }
  }
}
