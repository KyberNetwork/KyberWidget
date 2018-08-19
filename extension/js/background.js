const extension = require('extensionizer')
const height = 620
const width = 360

import Web3 from '../web3-metamask';

import MetamaskInpageProvider from 'metamask-crx/app/scripts/lib/inpage-provider.js';
import PortStream from 'metamask-crx/app/scripts/lib/port-stream.js';

const METAMASK_EXTENSION_ID = 'jahgpfaellhdfbjonknnlplbkmchbnng';
const metamaskPort = chrome.runtime.connect(METAMASK_EXTENSION_ID);
const pluginStream = new PortStream(metamaskPort);
const web3Provider = new MetamaskInpageProvider(pluginStream);
const web3 = new Web3(web3Provider);


console.log("+++++++++++++run in backgroujd: ", web3)
window.web3 = web3

var paramQuery = function(data) {
  return Object.keys(data).sort().map(function(k){
    return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
  }).join('&')
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("on listener !!!!!!!!!!!!!", request)
    if (request.name == "background-openKyberPay"){
      // window.open("index.html", "extension_popup", "width=300,height=400,status=no,scrollbars=yes,resizable=no");
      const cb = (currentPopup) => { 
        console.log("_____________creation callback", currentPopup)
        // currentPopup.web3 = web3
        // let currentWindows = extension.windows.find(win => {
        //   if(win && win.type === 'popup' && win.id === currentPopup.id){
        //     win.web3 = web3
        //   }
        // })
        // _getPopup(currentPopup.id, (err, win) => {
        //   console.log("_getPopup", err, win)
        //   if(win){
        //     win.web3 = web3
        //   }
        // })
        // this._popupId = currentPopup.id 
      }
      // window.open('index.html?' + paramQuery(request.payload))
      const creation = extension.windows.create({
        url: 'index.html?' + paramQuery(request.payload),
        type: 'popup',
        width,
        height,
      }, cb)
      
      creation && creation.then && creation.then(cb)
      sendResponse({status: "done"});
    }
      
  });


  var _getPopup = function (id, cb) {
    _getWindows((err, windows) => {
      if (err) throw err
      cb(null, _getPopupIn(id, windows))
    })
  }

  var _getWindows = function (cb) {
    // Ignore in test environment
    if (!extension.windows) {
      return cb()
    }

    extension.windows.getAll({}, (windows) => {
      cb(null, windows)
    })
  }
  var _getPopupIn = function (id, windows) {
    return windows ? windows.find((win) => {
      // Returns notification popup
      return (win && win.type === 'popup' && win.id === id)
    }) : null
  }