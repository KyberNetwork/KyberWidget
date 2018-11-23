import  constants from "./constants"
import * as common from "../utils/common"


import Language from "../../../lang/index"
import { initialize, addTranslation, addTranslationForLanguage, setActiveLanguage, localeReducer } from 'react-localize-redux';



import {initParamsGlobal} from "../actions/globalActions"
import {initParamsExchange} from "../actions/exchangeActions"



export function initParams(store){
    initLanguage(store)
    

    var query  = common.getQueryParams(window.location.search)

    store.dispatch(initParamsGlobal(query));
    
    var receiveAddr = common.getParameterByName("receiveAddr")
    var receiveToken = common.getParameterByName("receiveToken")
    var receiveAmount = common.getParameterByName("receiveAmount")


    //var tokens = store.tokens.tokens    
    store.dispatch(initParamsExchange(receiveAddr, receiveToken, receiveAmount));

   // console.log("query prams: " + JSON.stringify(query))

    // var receiveAddr = common.getParameterByName("receiveAddr")
    // var receiveToken = common.getParameterByName("receiveToken")
    // var receiveAmount = common.getParameterByName("receiveAmount")
    // var callback = common.getParameterByName("callback")
    // var network = common.getParameterByName("network")
    // var paramForwarding = common.getParameterByName("paramForwarding")
    // var signer = common.getParameterByName("signer")
    // var commissionID = common.getParameterByName("commissionID")
    // var theme = common.getParameterByName("theme")


}


const onMissingTranslation = (key, languageCode) => {
  // here you can do whatever you want e.g. call back end service that will 
  // console.log("-------------- missing transsaction")
  // console.log(key)
  // console.log(languageCode)
};


export function initLanguage(store){
  // const defaultLanguagePack = require("../../../lang/" + Language.defaultLanguage + ".json")
  // const arrayLangInit = Language.loadAll? Language.supportLanguage : Language.defaultAndActive 

  // store.dispatch(initialize(arrayLangInit, { 
  //   missingTranslationCallback: onMissingTranslation, 
  //   showMissingTranslationMsg: false,
  //   defaultLanguage: Language.defaultLanguage
  // }));
  // store.dispatch(addTranslationForLanguage(defaultLanguagePack, Language.defaultLanguage));

  // if(Language.loadAll){
  //   Language.otherLang.map((langName) => {
  //     try{
  //       let langData = require("../../../lang/" + langName + ".json")
  //       store.dispatch(addTranslationForLanguage(langData, langName));
  //     }catch(err){
  //       console.log(err)
  //     }
  //   })
  // }

  let languagePack, packName
  try {
    packName = common.getParameterByName('lang')
    if (packName){
      languagePack = require("../../../lang/" + packName + ".json")
    }else{
      packName = Language.defaultLanguage
      languagePack = require("../../../lang/" + packName + ".json")  
    }
  } catch (e) {
    console.log(e)
    packName = Language.defaultLanguage
    languagePack = require("../../../lang/" + packName + ".json")
  }
  console.log("________________ load loanguage ", packName)
  store.dispatch(initialize([packName], { 
    missingTranslationCallback: onMissingTranslation, 
    showMissingTranslationMsg: false,
    defaultLanguage: packName
  }));
  store.dispatch(addTranslationForLanguage(languagePack, packName));

}

export function getLanguage(key){
  let langData = require("../../../lang/" + key + ".json")
  return langData
}
