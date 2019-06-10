import Language from "../../../lang/index"
import { initialize, addTranslationForLanguage } from 'react-localize-redux';

export function initLanguage(language, store) {
  let languagePack

  try {
    languagePack = require("../../../lang/" + language + ".json")
  } catch (e) {
    language = Language.defaultLanguage
    languagePack = require("../../../lang/" + Language.defaultLanguage + ".json")
  }

  store.dispatch(initialize({
    languages: [
      { name: "", code: language }
    ],
    options: {
      renderToStaticMarkup: false,
      renderInnerHtml: true
    }
  }));

  store.dispatch(addTranslationForLanguage(languagePack, language));
}
