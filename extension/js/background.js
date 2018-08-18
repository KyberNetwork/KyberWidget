const extension = require('extensionizer')
const height = 620
const width = 360

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
      const cb = (currentPopup) => { this._popupId = currentPopup.id }

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