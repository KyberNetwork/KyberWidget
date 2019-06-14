import React from "react"
import { connect } from "react-redux"
import { push } from 'react-router-redux'
import DropFile from "../../components/ImportAccount/Keystore/DropFile"
import { importNewAccount, throwError } from "../../actions/accountActions"
import { verifyKey, anyErrors } from "../../utils/validators"
import { addressFromKey } from "../../utils/keys"
import { getTranslate } from 'react-localize-redux'
import constants from "../../services/constants";

@connect((store, props) => {
  var tokens = store.tokens.tokens
  var supportTokens = []
  Object.keys(tokens).forEach((key) => {
    supportTokens.push(tokens[key])
  })
  return {
    account: store.account,
    ethereum: store.connection.ethereum,
    tokens: supportTokens,
    translate: getTranslate(store.locale),
    screen: props.screen
  }
})

export default class ImportKeystore extends React.Component {

  lowerCaseKey = (keystring) => {
    return keystring.toLowerCase()
  }

  goToExchange = () => {
    this.props.dispatch(push('/exchange'));
  }

  onDrop = (files) => {
    try {
      var file = files[0]
      console.log(files)
      var fileReader = new FileReader()
      fileReader.onload = (event) => {
        var keystring = this.lowerCaseKey(fileReader.result)
        var errors = {}
        errors["keyError"] = verifyKey(keystring)
        if (anyErrors(errors)) {
          this.props.onOpenImportAccount(constants.IMPORT_ACCOUNT_TYPE.keystore);
          this.props.dispatch(throwError(this.props.translate('import.keystore_invalid') || "Your uploaded JSON file is invalid. Please upload a correct JSON keystore."))
        } else {
          var address = addressFromKey(keystring)
          this.props.dispatch(importNewAccount(address, "keystore", keystring))
        }
      }
      fileReader.readAsBinaryString(file)
    } catch (e) {
      console.log(e)
    }
  }

  render() {
    return (
      <DropFile
        error={this.props.account.error}
        onDrop={this.onDrop}
        translate={this.props.translate}
      />
    )
  }
}
