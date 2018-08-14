import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { Route } from 'react-router'
import { Link } from 'react-router-dom'
import { Layout } from "./containers/Layout"

import constanst from "./services/constants"
//import NotSupportPage from "./components/NotSupportPage"
//import platform from 'platform'
//import { blackList } from './blacklist'
import {initSession} from "./actions/globalActions"
import { PersistGate } from 'redux-persist/lib/integration/react'
import { persistor, store } from "./store"
import Modal from 'react-modal';


//console.log(platform)
//check browser compatible
// var clientPlatform = {
//   name: platform.name,
//   version: platform.version,
//   os: platform.os.family
// }

//  console.log("client: ", clientPlatform)

var illegal = false
// for (var i = 0; i < blackList.length; i++) {
//   if ((clientPlatform.name === blackList[i].name) && (clientPlatform.os === blackList[i].os)) {
//     illegal = true
//     break
//   }
//   // if (clientPlatform.version.substring(0, blackList[i].version.length) !== blackList[i].version) {
//   //   continue
//   // }
//   // if (clientPlatform.os.indexOf(blackList[i].os) === -1) {
//   //   continue
//   // }
//   // illegal = true
//   // break
// }
Modal.setAppElement('body');

window.kyberWidgetInstance = {}

console.log(document.getElementById(constanst.APP_NAME))
window.kyberWidgetInstance.render = renderApp => {
  if(!document.getElementById(constanst.APP_NAME)){
    return
  }
  // if (illegal) {
  //   ReactDOM.render(
  //     <NotSupportPage client={clientPlatform} />
  //     , document.getElementById(constanst.APP_NAME));
  // } else {
  //   ReactDOM.render(
  //     <PersistGate persistor={persistor}>
  //       <Provider store={store}>
  //         <Layout />
  //       </Provider>
  //     </PersistGate>, document.getElementById(constanst.APP_NAME));
  // }
  store.dispatch(initSession())
  ReactDOM.render(
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <Layout />
      </Provider>
    </PersistGate>, document.getElementById(constanst.APP_NAME));
}



window.kyberWidgetInstance.render()



