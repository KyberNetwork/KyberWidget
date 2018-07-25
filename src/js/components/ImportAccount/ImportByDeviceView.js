import React from "react";
import { roundingNumber } from "../../utils/converter"
import BLOCKCHAIN_INFO from "../../../../env"
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown'
import PathSelector from "../../containers/CommonElements/PathSelector";
import AddressSelector from "../../containers/CommonElements/AddressSelector";
import constants from '../../services/constants';

const ImportByDeviceView = (props) => {

  function choosePath(dpath) {
    let inputPath = document.getElementById('form-input-custom-path'),
      selectedPath = dpath;
    if (!dpath) {
      console.log("inputpath: ", inputPath.value)
      selectedPath = inputPath.value;
    }
    props.choosePath(selectedPath, dpath);
  }

  function getSelectAddressHtml() {
    if (props.isLoading || props.hasError) {
      return;
    }

    return (
      <div id="cold-wallet">
        <div className={"address-list-path"}>
          <div className="content">
            <div className="block-title">
              {props.translate("modal.select_hd_path") || "Select HD derivation path"}
            </div>
            <div className="block-choose-path">
              <PathSelector
                listItem={props.dPath}
                choosePath={choosePath}
                walletType={props.walletType}
                currentDPath={props.currentDPath}
              />
            </div>

            <div className="block-title">
              {props.translate("modal.select_address") || "Select the Address you'd' like to use"}
            </div>
            <div className="block-choose-path">
              <AddressSelector
                isFirstList={props.isFirstList}
                addresses={props.currentAddresses}
                currentAddress={props.currentAddress}
                setAddress={props.setAddress}
                getPreAddress={props.getPreAddress}
                getMoreAddress={props.getMoreAddress}
                translate={props.translate}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="payment-gateway__step-title payment-gateway__step-title--2">
        {props.translate(`modal.select_${props.walletType}_address`) || 'Select Address'}
      </div>

      <div className={"import-account-content__info"}>
        <div className={"import-account-content__info-type"}>
          <img
            className={"import-account-content__info-type-image"}
            src={require(`../../../assets/img/landing/${props.walletType}_active.svg`)}/>
          <div className={"import-account-content__info-type-text"}>
            {props.translate("import.from_ledger") || "LEDGER"}
          </div>
        </div>
        <div className={"import-account-content__info-text"}></div>
      </div>

      <div className="import-account-content__device">
        {getSelectAddressHtml()}
      </div>

      {props.hasError &&
      <div className="import-account-content__error">{props.error}</div>
      }

      <div className={"import-account-content__button-container"}>
        <div className={"import-account-content__button payment-gateway__button"} onClick={props.onCloseImportAccount}>
          {props.translate("transaction.back") || "Back"}
        </div>

        {!props.hasError &&
        <div className={"import-account-content__button payment-gateway__button"} onClick={props.getAddress}>
          {props.translate("transaction.next") || "Next"}
        </div>
        }
      </div>
    </div>
  )
}

export default ImportByDeviceView
