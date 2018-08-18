
var kpay = {
  author: "Tuan Nguyen",
  ver: "1.0",

  receiveAddr: null,
  receiveToken: null,
  receiveAmount: null,
  callback: null,
  network: null,
  paramForwarding: null,
  signer: null,
  commissionID: null
}

function openKyberPayPopup(params){
  // var event = document.createEvent('Event');
  // event.initEvent('openKyberPay', true, true);
  // document.dispatchEvent(event);
  console.log("++++++++++++++on open kyber pay popup~~~~~~~~~~~~~~", params)
  var evt = new CustomEvent("openKyberPay", {detail: params});
  window.dispatchEvent(evt);
}

console.log("inpage created instance kpay")

kpay.contribute = function (params) {
  kpay.receiveAddr = params.receiveAddr
  kpay.receiveToken = params.receiveAddr
  kpay.receiveAmount = params.receiveAddr
  kpay.callback = params.receiveAddr
  kpay.network = params.receiveAddr
  kpay.paramForwarding = params.receiveAddr
  kpay.signer = params.receiveAddr
  kpay.commissionID = params.receiveAddr

  openKyberPayPopup(params)

}