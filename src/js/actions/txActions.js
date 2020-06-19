export function addTx(tx) {
  return {
    type: "TX.TX_ADDED",
    payload: tx
  }
}