import React from "react";
import {addPrefixClass} from "../../utils/className"

const SignerAddress = (props) => {
  return (
    <div className={addPrefixClass("signer-address")}>
      <div className={addPrefixClass("signer-address__title")}>Access in one of these Addresses</div>
      <div className={addPrefixClass("signer-address__container")}>
        {props.signerAddresses.map((address, index) =>
          <div className={addPrefixClass("signer-address__wallet")} key={index}>
          <div className={addPrefixClass("signer-address__wallet-name")}>Address {index + 1}:</div>
          <div className={addPrefixClass("signer-address__wallet-hash")}>{address}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SignerAddress
