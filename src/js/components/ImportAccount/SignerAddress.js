import React from "react";
import {addPrefixClass} from "../../utils/className"

const SignerAddress = (props) => {
  return (
    <div className={addPrefixClass("signer-address common__information box")}>
      <div className={addPrefixClass("signer-address__title")}>Please check these access Addresses</div>
      <div className={addPrefixClass("signer-address__container")}>
        {props.signerAddresses.map((address, index) =>
          <div className={addPrefixClass("signer-address__wallet")} key={index}>{address}</div>
        )}
      </div>
    </div>
  )
}

export default SignerAddress
