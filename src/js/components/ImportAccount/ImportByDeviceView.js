import React from "react";
import PathSelector from "../../containers/CommonElements/PathSelector";
import AddressSelector from "../../containers/CommonElements/AddressSelector";
import { addPrefixClass } from "../../utils/className"

const ImportByDeviceView = (props) => {
  function choosePath(dpath) {
    const inputPath = document.getElementById('form-input-custom-path');
    let selectedPath = dpath;

    if (!dpath) {
      selectedPath = inputPath.value;
    }

    props.choosePath(selectedPath, dpath);
  }

  return (
    <div>
      <div className={addPrefixClass("widget-exchange__text theme-text")}>
        {props.translate(`modal.select_${props.chosenImportAccount}_address`) || 'Select Address'}
      </div>

      <div className={addPrefixClass("import-account-content__info")}>
        <div className={addPrefixClass(`import-account-content__info-type theme-border ${props.hasError ? 'error' : ''}`)}>
          <div>
            <div className={addPrefixClass(`importer__icon ${props.chosenImportAccount}`)}/>
            <div className={addPrefixClass("import-account-content__info-type-text")}>
              {props.chosenImportAccount}
            </div>
          </div>
        </div>
        {!props.hasError &&
        <div className={addPrefixClass("import-account-content__info-text")}>
          <div className={addPrefixClass("import-account-content__info-text-address")}>
            <div className={addPrefixClass("title")}>{props.translate("transaction.address") || "Address"}: </div>
            <div className={addPrefixClass("address common__one-line")}>{props.wallet.address.slice(0, 12)}...{props.wallet.address.slice(-6)}</div>
          </div>
          <div className={addPrefixClass("import-account-content__info-text-balance")}>
            <div className={addPrefixClass("title")}>{props.translate("transaction.balance") || "Balance"}: </div>
            <div className={addPrefixClass("address common__one-line")}>{props.wallet.balance} ETH</div>
          </div>
        </div>
        }
      </div>

      <div className={addPrefixClass("import-account-content__device")}>
        {(!props.isLoading && !props.hasError) && (
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
        )}
      </div>

      {props.hasError &&
      <div className={addPrefixClass("import-account-content__error")}>{props.error}</div>
      }
    </div>
  )
};

export default ImportByDeviceView
