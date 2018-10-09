import React from "react";
import PathSelector from "../../containers/CommonElements/PathSelector";
import AddressSelector from "../../containers/CommonElements/AddressSelector";
import {addPrefixClass} from "../../utils/className"
import { getAssetUrl } from "../../utils/common";

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
      <div className={addPrefixClass("cold-wallet")}>
        <div className={addPrefixClass("address-list-path")}>
          <div className={addPrefixClass("k-content")}>
            <div className={addPrefixClass("block-title")}>
              {props.translate("modal.select_hd_path") || "Select HD derivation path"}
            </div>
            <div className={addPrefixClass("block-choose-path")}>
              <PathSelector
                listItem={props.dPath}
                choosePath={choosePath}
                walletType={props.walletType}
                currentDPath={props.currentDPath}
              />
            </div>

            <div className={addPrefixClass("block-title")}>
              {props.translate("modal.select_address") || "Select the Address you'd' like to use"}
            </div>
            <div className={addPrefixClass("block-choose-path block-choose-path__select-address")}>
              <AddressSelector
                isFirstList={props.isFirstList}
                addresses={props.currentAddresses}
                wallet={props.wallet}
                setWallet={props.setWallet}
                walletType={props.walletType}
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
      <div className={addPrefixClass("payment-gateway__step-title payment-gateway__step-title--2")}>
        {props.translate(`modal.select_${props.chosenImportAccount}_address`) || 'Select Address'}
      </div>

      <div className={addPrefixClass("import-account-content__info " + (!props.hasError ? 'import-account-content__info--center' : ''))}>
        <div className={addPrefixClass("import-account-content__info-type")}>
          <img
            className={addPrefixClass("import-account-content__info-type-image")}
            src={getAssetUrl(`wallets/${props.chosenImportAccount}.svg`)}/>
          <div className={addPrefixClass("import-account-content__info-type-text")}>
            {props.chosenImportAccount}
          </div>
        </div>
        {!props.hasError &&
        <div className={addPrefixClass("import-account-content__info-text")}>
          <div className={addPrefixClass("import-account-content__info-text-address")}>
          {props.translate("transaction.address") || "Address"}: {props.wallet.address.slice(0, 8)}...{props.wallet.address.slice(-6)}
          </div>
          <div className={addPrefixClass("import-account-content__info-text-balance")}>
          {props.translate("transaction.balance") || "Balance"}: {props.wallet.balance} ETH
          </div>
        </div>
        }
      </div>

      <div className={addPrefixClass("import-account-content__device")}>
        {getSelectAddressHtml()}
      </div>

      {props.hasError &&
      <div className={addPrefixClass("import-account-content__error")}>{props.error}</div>
      }

      <div className={addPrefixClass("import-account-content__button-container")}>
        <div className={addPrefixClass("import-account-content__button payment-gateway__button--back")} onClick={props.onCloseImportAccount}>
          {props.translate("transaction.back") || "Back"}
        </div>

        {!props.hasError &&
        <div className={addPrefixClass("import-account-content__button payment-gateway__button")} onClick={props.getAddress}>
          {props.translate("transaction.next") || "Next"}
        </div>
        }
      </div>
    </div>
  )
}

export default ImportByDeviceView
