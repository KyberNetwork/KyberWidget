export function initListTokens(network) {
  return {
    type: "TOKEN.INIT_LIST_TOKEN",
    payload: {network}
  }
}
