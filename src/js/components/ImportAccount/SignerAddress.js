import React from "react";

const SignerAddress = (props) => {
  return (
    <div className={"signer-address"}>
      <div className={"signer-address__title"}>Access in one of these Addresses</div>
      <div className={"signer-address__container"}>
        {props.signerAddresses.map((address, index) =>
          <div className={"signer-address__wallet"} key={index}>
          <div className={"signer-address__wallet-name"}>Address {index + 1}:</div>
          <div className={"signer-address__wallet-hash"}>{address}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SignerAddress
