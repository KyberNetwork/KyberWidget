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



setupInjection()


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