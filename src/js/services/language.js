import Language from "../../../lang/index"
import { initialize, addTranslationForLanguage } from 'react-localize-redux';

const onMissingTranslation = (key, languageCode) => {
};

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function initLanguage(store){
  let languagePack, packName
  try {
    packName = getParameterByName('lang')
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
