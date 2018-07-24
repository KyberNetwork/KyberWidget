import React from "react"
import { ImportByDevice } from "../ImportAccount"
import { Trezor } from "../../services/keys"
import { connect } from "react-redux"
import { getTranslate } from 'react-localize-redux'
import Constants from '../../constants';

@connect((store, props) => {
  return {
    translate: getTranslate(store.locale),
    screen: props.screen
  }
})
export default class ImportByDeviceWithTrezor extends React.Component {
  deviceService = new Trezor()
  
  render = () => {
    return(
      <ImportByDevice
        type={Constants.IMPORT_TREZOR_TYPE}
        deviceService={this.deviceService} 
        screen={this.props.screen}
        onCloseImportAccount={this.props.onCloseImportAccount}
      />
    )
  }
}
