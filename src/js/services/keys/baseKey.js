import { biggestNumber } from "../../utils/converter";

export const sendEtherFromAccount = (
  id, ethereum, account, sourceToken, sourceAmount, destAddress,
  nonce, gas, gasPrice, keystring, accountType, password, networkId
) => {

  const txParams = createTxParams(account, nonce, gasPrice, gas, destAddress, sourceAmount, "", networkId);

  return new Promise((resolve) => {
    resolve({ txParams, keystring, password })
  })
};

export const sendTokenFromAccount = (
  id, ethereum, account, sourceToken, sourceAmount, destAddress,
  nonce, gas, gasPrice, keystring, accountType, password, networkId
) => {
  return new Promise((resolve) => {
    ethereum.call("sendTokenData", sourceToken, sourceAmount, destAddress).then(result => {

      const txParams = createTxParams(account, nonce, gasPrice, gas, sourceToken, "0x0", result, networkId);

      resolve({ txParams, keystring, password })
    })
  })
};

export const etherToOthersFromAccount = (
  id, ethereum, account, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount,
  minConversionRate, commissionId, nonce, gas, gasPrice, keystring, accountType, password, networkId, kyberNetwork
) => {
  return new Promise((resolve) => {
    ethereum.call("exchangeData", sourceToken, sourceAmount, destToken, destAddress,
      maxDestAmount, minConversionRate, commissionId).then(result => {

      const txParams = createTxParams(account, nonce, gasPrice, gas, kyberNetwork, sourceAmount, result, networkId);

      resolve({ txParams, keystring, password })
    })
  })
};

export const tokenToOthersFromAccount = (
  id, ethereum, account, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
  commissionId, nonce, gas, gasPrice, keystring, accountType, password, networkId, kyberNetwork
) => {
  return new Promise((resolve) => {
    ethereum.call("exchangeData", sourceToken, sourceAmount, destToken, destAddress,
      maxDestAmount, minConversionRate, commissionId).then(result => {

      const txParams = createTxParams(account, nonce, gasPrice, gas, kyberNetwork, "0x0", result, networkId);

      resolve({ txParams, keystring, password })
    })
  })
};

export const sendEtherPayment = (
  id, ethereum, account, sourceToken, sourceAmount, destAddress, nonce, gas, gasPrice,
  keystring, accountType, password, networkId, contract, commissionID, paymentData, hint
) => {
  return new Promise((resolve) => {
    ethereum.call("getPaymentEncodedData", sourceToken, sourceAmount, sourceToken, destAddress,
      sourceAmount, 0, commissionID, paymentData, hint).then(result => {

      const txParams = createTxParams(account, nonce, gasPrice, gas, contract, sourceAmount, result, networkId);

      resolve({ txParams, keystring, password })
    })
  })
};

export const sendTokenPayment = (
  id, ethereum, account, sourceToken, sourceAmount, destAddress, nonce, gas, gasPrice,
  keystring, accountType, password, networkId, contract, commissionID, paymentData, hint
) => {
  return new Promise((resolve) => {
    ethereum.call("getPaymentEncodedData", sourceToken, sourceAmount, sourceToken, destAddress,
      sourceAmount, 0, commissionID, paymentData, hint).then(result => {

      const txParams = createTxParams(account, nonce, gasPrice, gas, contract, "0x0", result, networkId);

      resolve({ txParams, keystring, password })
    })
  })
};

export const etherToOthersPayment= (
  id, ethereum, account, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
  commissionId, nonce, gas, gasPrice, keystring, accountType, password, networkId, toContract, paymentData, hint
) => {
  return new Promise((resolve) => {
    ethereum.call("getPaymentEncodedData", sourceToken, sourceAmount, destToken, destAddress,
      maxDestAmount, minConversionRate, commissionId, paymentData, hint).then(result => {

      const txParams = createTxParams(account, nonce, gasPrice, gas, toContract, sourceAmount, result, networkId);

      resolve({ txParams, keystring, password })
    })
  })
};

export const tokenToOthersPayment = (
  id, ethereum, account, sourceToken, sourceAmount, destToken, destAddress, maxDestAmount, minConversionRate,
  commissionId, nonce, gas, gasPrice, keystring, accountType, password, networkId, toContract, paymentData, hint
) => {
  return new Promise((resolve) => {
    ethereum.call("getPaymentEncodedData", sourceToken, sourceAmount, destToken, destAddress,
      maxDestAmount, minConversionRate, commissionId, paymentData, hint).then(result => {

      const txParams = createTxParams(account, nonce, gasPrice, gas, toContract, "0x0", result, networkId);

      resolve({ txParams, keystring, password })
    })
  })
};

export const getAppoveToken = (
  isPayMode, ethereum, sourceToken, sourceAmount, nonce, gas, gasPrice,
  keystring, password, accountType, account, networkId, isApproveZero = false
) => {
  const value = isApproveZero ? 0 : biggestNumber();

  return new Promise((resolve) => {
    ethereum.call("approveTokenData", sourceToken, value, isPayMode).then(result => {

      const txParams = createTxParams(account, nonce, gasPrice, gas, sourceToken, "0x0", result, networkId);

      resolve({ txParams, keystring, password })
    })
  })
};

function createTxParams(account, nonce, gasPrice, gas, to, value, data, chainId) {
  return {
    from: account,
    nonce: nonce,
    gasPrice: gasPrice,
    gasLimit: gas,
    to: to,
    value: value,
    data: data,
    // EIP 155 chainId - mainnet: 1, ropsten: 3
    chainId: chainId
  };
}
