const fs = require('fs')
const path = require('path')
const extension = require('extensionizer')
var requireText = require('require-text')

// const inpageContent = requireText('./inpage.js', require)
console.log(__dirname)
const inpageContent = fs.readFileSync(path.join(__dirname, '..', '..', 'dist', 'extension', 'inpage.js')).toString()

console.log("+++++++++++++inpageContent +++++++", inpageContent)
// const inpageSuffix = '//# sourceURL=' + extension.extension.getURL('inpage.js') + '\n'
const inpageBundle = inpageContent

console.log("includeKPay: ", includeKPay())
if(shouldInjectKPay()){
  setupInjection()
}

function shouldInjectKPay () {
  return doctypeCheck() && suffixCheck() &&
    documentElementCheck() && !blacklistedDomainCheck() && !includeKPay()
}

function doctypeCheck () {
  const doctype = window.document.doctype
  if (doctype) {
    return doctype.name === 'html'
  } else {
    return true
  }
}

function suffixCheck () {
  var prohibitedTypes = ['xml', 'pdf']
  var currentUrl = window.location.href
  var currentRegex
  for (let i = 0; i < prohibitedTypes.length; i++) {
    currentRegex = new RegExp(`\\.${prohibitedTypes[i]}$`)
    if (currentRegex.test(currentUrl)) {
      return false
    }
  }
  return true
}

function documentElementCheck () {
  var documentElement = document.documentElement.nodeName
  if (documentElement) {
    return documentElement.toLowerCase() === 'html'
  }
  return true
}

function blacklistedDomainCheck () {
  var blacklistedDomains = [
    'uscourts.gov',
    'dropbox.com',
    'webbyawards.com',
    'cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html',
    'adyen.com',
    'gravityforms.com',
    'harbourair.com',
    'ani.gamer.com.tw',
    'blueskybooking.com',
  ]
  var currentUrl = window.location.href
  var currentRegex
  for (let i = 0; i < blacklistedDomains.length; i++) {
    const blacklistedDomain = blacklistedDomains[i].replace('.', '\\.')
    currentRegex = new RegExp(`(?:https?:\\/\\/)(?:(?!${blacklistedDomain}).)*$`)
    if (!currentRegex.test(currentUrl)) {
      return true
    }
  }
  return false
}

function includeKPay() {
  return window.kpay ? true : false
}


/**
 * Creates a script tag that injects inpage.js
 */
function setupInjection () {
  try {
    // inject in-page script
    var scriptTag = document.createElement('script')
    scriptTag.textContent = inpageBundle
    scriptTag.onload = function () { this.parentNode.removeChild(this) }
    var container = document.head || document.documentElement
    // append as first child
    container.insertBefore(scriptTag, container.children[0])
  } catch (e) {
    console.error('Metamask injection failed.', e)
  }
}

window.addEventListener("openKyberPay", function(data) {
  console.log("________________on openKyberPay", data.detail)
  chrome.runtime.sendMessage({
    name: "background-openKyberPay",
    payload: data.detail
  });
});
