import constants from "../services/constants"
import * as converter from "../utils/converter"

var initState = constants.INIT_EXCHANGE_FORM_STATE
initState.snapshot = constants.INIT_EXCHANGE_FORM_STATE

const exchange = (state = initState, action) => {
  var newState = { ...state, errors: { ...state.errors } }
  switch (action.type) {
    case "EXCHANGE.SET_RANDOM_SELECTED_TOKEN":
      var exchange = { ...state }
      var random = action.payload
      exchange.sourceToken = random[0].address;
      exchange.sourceTokenSymbol = random[0].symbol;
      exchange.destToken = random[1].address;
      exchange.destTokenSymbol = random[1].symbol;
      return { ...exchange }
    case "EXCHANGE.MAKE_NEW_EXCHANGE": {
      var newState = { ...state };
      newState.selected = true;
      newState.sourceAmount = ""
      newState.destAmount = ""
      newState.errors = initState.errors
      newState.advanced = false
      newState.bcError = ""
      newState.step = initState.step
      newState.minConversionRate = newState.slippageRate
      newState.isEditRate = false
      newState.isAnalize = false
      newState.isAnalizeComplete = false
      return newState
    }
    case "EXCHANGE.SELECT_TOKEN_ASYNC": {
      newState.isSelectToken = true
      return newState
    }
    case "EXCHANGE.SET_LOADING_SELECT_TOKEN": {
      newState.isSelectToken = action.payload
      return newState
    }
    case "EXCHANGE.SELECT_TOKEN": {
      if (action.payload.type === "source") {
        newState.sourceTokenSymbol = action.payload.symbol
        newState.sourceToken = action.payload.address
      } else if (action.payload.type === "des") {
        newState.destTokenSymbol = action.payload.symbol
        newState.destToken = action.payload.address
      }

      for (var key in newState.errors) {
        newState.errors[key] = ""
      }

      newState.selected = true
      newState.isEditRate = false
      return newState
    }
    case "EXCHANGE.CHECK_SELECT_TOKEN": {
      newState.errors.selectTokenToken = ''
      newState.errors.sourceAmountError = ''

      if (newState.isSwap) {
        if(newState.destTokenSymbol === newState.sourceTokenSymbol){
          newState.errors.selectSameToken = action.payload
        } else {
          newState.errors.selectSameToken = ""
        }
      }

      return newState
    }
    case "EXCHANGE.THROW_SOURCE_AMOUNT_ERROR": {
      newState.errors.sourceAmountError = action.payload
      return newState
    }
    case "EXCHANGE.THROW_ETH_BALANCE_ERROR": {
      newState.errors.ethBalanceError = action.payload
      return newState
    }
    case "EXCHANGE.THROW_GAS_PRICE_ERROR": {
      newState.errors.gasPriceError = action.payload
      return newState
    }
    case "EXCHANGE.THROW_RATE_ERROR": {
      newState.errors.rateError = action.payload
      return newState
    }
    case "EXCHANGE.GO_TO_STEP": {
      var {step, oldStep} = action.payload
      if (step === 1 || step === 2){
        var errors = {}
        Object.keys(newState.errors).map(key => {
          errors[key] = ""
        })
        newState.errors = {...errors}
      }
      if ((step === 2) && (oldStep === 3)){
        newState.validateAccountComplete = false
        newState.broadcastError = ""
        newState.signError = ""
        newState.passwordError = ""
      }
      newState.step = step
      return newState
    }
    case "EXCHANGE.SPECIFY_GAS_PRICE": {
      newState.gasPrice = action.payload
      newState.isEditGasPrice = true
      newState.errors.gasPriceError = ""
      newState.errors.ethBalanceError = ""
      return newState
    }
    case "EXCHANGE.TOGGLE_ADVANCE": {
      newState.advanced = !newState.advanced
      return newState
    }
    case "EXCHANGE.APPROVAL_TX_BROADCAST_REJECTED": {
      newState.broadcasting = false
      newState.bcError = action.payload ? action.payload : ""
      newState.showConfirmApprove = false
      newState.isApproving = false
      return newState
    }
    case "EXCHANGE.SET_SIGN_ERROR": {
      newState.signError = action.payload ? action.payload : ""
      newState.isApproving = false
      newState.isConfirming = false
      return newState
    }
    case "EXCHANGE.RESET_SIGN_ERROR": {
      newState.signError = ''
      return newState
    }
    case "EXCHANGE.SET_BROADCAST_ERROR": {
      newState.broadcasting = false
      if (action.payload){
        newState.broadcastError = action.payload
      }else{
        newState.broadcastError = "Cannot broadcast transaction to blockchain"
      }
      newState.confirmApprove = false
      newState.isApproving = false
      newState.isConfirming = false
      //newState.step = 3
      return newState
    }
    case "EXCHANGE.RESET_BROADCAST_ERROR": {
      newState.broadcastError = ''
      return newState
    }
    case "EXCHANGE.TX_BROADCAST_FULFILLED": {
      newState.broadcasting = false
      newState.txHash = action.payload
      return newState
    }
    case "EXCHANGE.TX_BROADCAST_REJECTED": {
      newState.broadcasting = false
      newState.bcError = action.payload ? action.payload : ""
      newState.isConfirming = false
      newState.deviceError = action.payload ? action.payload : ''
      return newState
    }
    case "EXCHANGE.HANDLE_AMOUNT":{
      newState.errors.rateSystem = "Kyber cannot handle your amount, please reduce amount"
      return newState
    }
    case "EXCHANGE.RESET_HANDLE_AMOUNT_ERROR": {
      newState.errors.rateSystem = "";
      return newState
    }
    case "EXCHANGE.UPDATE_RATE": {
      const { rateInit, expectedPrice, slippagePrice, blockNo, isSuccess, errors } = action.payload

      if (!isSuccess) {
        newState.errors.rateSystem = errors.getRate;
      } else {
        if (expectedPrice === "0") {
          if(rateInit === "0" || rateInit === 0 || rateInit === undefined || rateInit === null) {
            newState.errors.rateSystem = errors.kyberMaintain;
          } else {
            newState.errors.rateSystem = errors.handleAmount;
          }
        } else {
          newState.errors.rateSystem = ""
        }
      }
    
      var slippageRate = slippagePrice === "0" ? converter.estimateSlippagerate(rateInit, 18) : converter.toT(slippagePrice, 18)
      var expectedRate = expectedPrice === "0" ? rateInit : expectedPrice
    
      newState.slippageRate = slippageRate
      newState.offeredRate = expectedRate
      newState.blockNo = blockNo

      if (newState.sourceAmount !== "") {
        newState.minDestAmount = converter.calculateDest(newState.sourceAmount, expectedRate).toString(10)
      }
      //calcuale dest amoutn/ source amount
      if (newState.isSwap){
        if (newState.isHaveDestAmount){
          newState.sourceAmount = expectedPrice === "0"?"0": converter.caculateSourceAmount(newState.destAmount, expectedRate, 6)
        }else{
          if (newState.inputFocus === 'dest'){
            newState.sourceAmount = expectedPrice === "0"?"0": converter.caculateSourceAmount(newState.destAmount, expectedRate, 6)
          }else{
            newState.destAmount = expectedPrice === "0"?"0": converter.calculateDest(newState.sourceAmount, expectedRate, 6)
          }
        }
      }
      if (!newState.isEditRate) {
        newState.minConversionRate = slippageRate
      }
      newState.isSelectToken = false
      return newState
    }
    case "EXCHANGE.UPDATE_RATE_SNAPSHOT_COMPLETE": {
      var { rateInit, expectedPrice, slippagePrice, rateInitSlippage } = action.payload


      var slippageRate = slippagePrice === "0" ? rateInitSlippage : slippagePrice
      var expectedRate = expectedPrice === "0" ? rateInit : expectedPrice

      newState.snapshot.slippageRate = slippagePrice
      newState.snapshot.offeredRate = expectedRate

      if (newState.sourceAmount !== "") {
        newState.snapshot.minDestAmount = converter.calculateDest(newState.snapshot.sourceAmount, expectedRate).toString(10)
      }

      if (!newState.isEditRate) {
        newState.snapshot.minConversionRate = slippageRate
      }
      newState.snapshot.isSelectToken = false

      return newState

    }
    case "EXCHANGE.OPEN_PASSPHRASE": {
      newState.passphrase = true
      return newState
    }
    case "EXCHANGE.HIDE_PASSPHRASE": {
      newState.passphrase = false
      newState.errors.passwordError = ""
      return newState
    }
    case "EXCHANGE.HIDE_CONFIRM": {
      newState.confirmColdWallet = false
      return newState
    }
    case "EXCHANGE.SHOW_CONFIRM": {
      newState.confirmApprove = false
      newState.showConfirmApprove = false
      newState.confirmColdWallet = true
      newState.isFetchingGas = true
      return newState
    }
    case "EXCHANGE.HIDE_APPROVE": {
      newState.confirmApprove = false
      newState.isApproving = false
      newState.signError = ''
      return newState
    }
    case "EXCHANGE.SHOW_APPROVE": {
      newState.confirmApprove = true
      newState.isFetchingGas = true
      return newState
    }
    case "EXCHANGE.CHANGE_PASSPHRASE": {
      newState.errors.passwordError = ""
      return newState
    }
    case "EXCHANGE.THROW_ERROR_PASSPHRASE": {
      //newState.errors.passwordError = action.payload
      newState.passwordError = action.payload
      newState.isConfirming = false
      return newState
    }
    case "EXCHANGE.FINISH_EXCHANGE": {
      newState.broadcasting = false
      return newState
    }
    case "EXCHANGE.PREPARE_BROADCAST": {
      newState.passphrase = false
      newState.confirmColdWallet = false
      newState.confirmApprove = false
      newState.isApproving = false
      newState.isConfirming = false
      newState.bcError = ""
      newState.broadcasting = true

      return newState
    }
    case "EXCHANGE.PROCESS_APPROVE": {
      newState.isApproving = true;
      newState.isConfirming = true;
      return newState
    }
    case "TRANSFER.PROCESS_TRANSFER":
    case "EXCHANGE.PROCESS_EXCHANGE": {
      newState.isConfirming = true
      return newState
    }
    case "TX.TX_ADDED": {
      newState.tempTx = action.payload
      return newState
    }
    case "TX.UPDATE_TX_FULFILLED": {
      if (newState.tempTx.hash === action.payload.hash) {
        newState.tempTx = action.payload
      }
      return newState
    }
    case "EXCHANGE.CACULATE_AMOUNT": {
      if (state.errors.selectSameToken || state.errors.selectTokenToken) return newState
      if (state.inputFocus == "dest") {
        newState.sourceAmount = converter.caculateSourceAmount(state.destAmount, state.offeredRate, 6)
      } else {
        newState.destAmount = converter.caculateDestAmount(state.sourceAmount, state.offeredRate, 6)
      }
      return newState
    }
    case "EXCHANGE.CACULATE_AMOUNT_SNAPSHOT": {
      if (newState.snapshot.errors.selectSameToken || state.snapshot.errors.selectTokenToken) return newState
      if(newState.isHaveDestAmount){
        newState.snapshot.sourceAmount = converter.caculateSourceAmount(state.snapshot.destAmount, state.snapshot.offeredRate, 6)
      }else{
        newState.snapshot.destAmount = converter.caculateDestAmount(state.snapshot.sourceAmount, state.snapshot.offeredRate, 6)
      }

      newState.snapshot.isFetchingRate = false
      return newState
    }
    case "EXCHANGE.INPUT_CHANGE": {
      let focus = action.payload.focus
      let value = action.payload.value
      if (focus == "source") {
        newState.sourceAmount = value
        newState.errors.sourceAmountError = ""
        newState.errors.ethBalanceError = ""
        if (state.errors.selectSameToken || state.errors.selectTokenToken) return newState
        newState.destAmount = converter.caculateDestAmount(value, state.offeredRate, 6)
      }
      else if (focus == "dest") {
        newState.destAmount = value
        newState.errors.destAmountError = ""
        newState.errors.sourceAmountError = ""
        if (state.errors.selectSameToken || state.errors.selectTokenToken) return newState
        newState.sourceAmount = converter.caculateSourceAmount(value, state.offeredRate, 6)
      }
      return newState
    }
    case "EXCHANGE.FOCUS_INPUT": {
      newState.inputFocus = action.payload
      return newState
    }
    case "EXCHANGE.UPDATE_CURRENT_BALANCE": {
      const {sourceBalance, destBalance, txHash} = action.payload
      if (txHash === newState.txHash) {
        newState.balanceData.nextSource = sourceBalance
        newState.balanceData.nextDest = destBalance
      }
      return newState
    }
    case "EXCHANGE.SET_TERM_AND_SERVICES": {
      newState.termAgree = action.payload.value
      return newState
    }
    case "EXCHANGE.SET_MIN_RATE": {
      newState.minConversionRate = action.payload.value
      newState.errors.rateError = ''
      newState.isEditRate = true
      return newState
    }
    case "EXCHANGE.RESET_MIN_RATE": {
      newState.minConversionRate = newState.offeredRate
      newState.isEditRate = true
      newState.errors.rateError = ''
      return newState
    }
    case "EXCHANGE.SET_GAS_USED": {
      const {gas, gas_approve} = action.payload      
      newState.gas = gas
      newState.gas_approve = gas_approve
      return newState
    }
    case "EXCHANGE.SET_GAS_USED_SNAPSHOT": {
      const {gas, gas_approve} = action.payload
      newState.snapshot.gas = gas
      newState.snapshot.gas_approve = gas_approve
      return newState
    }
    case "EXCHANGE.SET_PREV_SOURCE": {
      newState.prevAmount = action.payload.value
      return newState
    }
    case "EXCHANGE.SWAP_TOKEN": {
      var tempSourceToken = newState.sourceToken
      var tempSourceTokenSymbol = newState.sourceTokenSymbol
      newState.sourceToken = newState.destToken
      newState.sourceTokenSymbol = newState.destTokenSymbol
      newState.destToken = tempSourceToken
      newState.destTokenSymbol = tempSourceTokenSymbol
      newState.sourceAmount = ""
      newState.destAmount = 0
      newState.isSelectToken = true
      newState.isEditRate = false

      newState.errors.sourceAmountError = initState.errors.sourceAmountError
      newState.errors.ethBalanceError = initState.errors.ethBalanceError

      return newState
    }
    case "EXCHANGE.SET_CAP_EXCHANGE": {
      newState.maxCap = action.payload.maxCap
      return newState
    }
    case "EXCHANGE.SET_GAS_PRICE_SWAP_COMPLETE": {

      if (!newState.isEditGasPrice) {
        var { safeLowGas, standardGas, fastGas, defaultGas, selectedGas } = action.payload

        var gasPriceSuggest = {...newState.gasPriceSuggest}
        
        gasPriceSuggest.fastGas = Math.round(fastGas * 10) / 10
        gasPriceSuggest.standardGas = Math.round(standardGas * 10)/10
        gasPriceSuggest.safeLowGas = Math.round(safeLowGas * 10)/10

        newState.gasPriceSuggest = {...gasPriceSuggest}
        newState.gasPrice =  Math.round(defaultGas * 10)/10

        newState.selectedGas = selectedGas
      }
      return newState
    }
    case "EXCHANGE.SET_MAX_GAS_PRICE_COMPLETE": {
      newState.maxGasPrice = action.payload
      return newState
    }
    case "EXCHANGE.UPDATE_RATE_PENDING": {
      const isManual = action.payload.isManual
      if (isManual) {
        newState.isSelectToken = true
      }
      return newState
    }
    case "EXCHANGE.ANALYZE_ERROR": {
      const {txHash} = action.payload
      if (txHash === newState.txHash){
        newState.isAnalize = true
      }
      return newState
    }
    case "EXCHANGE.SET_ANALYZE_ERROR": {
      const { networkIssues, txHash } = action.payload
      if (txHash === newState.txHash){
        newState.analizeError = { ...networkIssues }
        newState.isAnalize = false
        newState.isAnalizeComplete = true
      }
      return newState
    }
    case "EXCHANGE.FETCH_GAS":{
      newState.isFetchingGas = true
      return newState
    }
    case "EXCHANGE.FETCH_GAS_SUCCESS":{
      newState.isFetchingGas = false
      return newState
    }
    case "EXCHANGE.FETCH_GAS_SNAPSHOT":{
      newState.snapshot.isFetchingGas = true
      return newState
    }
    case "EXCHANGE.FETCH_GAS_SUCCESS_SNAPSHOT":{
      newState.snapshot.isFetchingGas = false
      return newState
    }
    case "EXCHANGE.SET_KYBER_ENABLE":{
      newState.kyber_enabled = action.payload
      return newState
    }
    case "EXCHANGE.SET_SNAPSHOT": {
      var snapshot  = action.payload
      newState.snapshot = {...snapshot}
      return newState
    }
    case "EXCHANGE.SET_SNAPSHOT_GAS_PRICE": {
      newState.snapshot.gasPrice = action.payload;
      return newState
    }
    case "EXCHANGE.SET_SNAPSHOT_MIN_CONVERSION_RATE": {
      newState.snapshot.minConversionRate = action.payload;
      return newState
    }
    case "EXCHANGE.THROW_NOT_POSSESS_KGT_ERROR": {
      newState.errorNotPossessKgt = action.payload
      return newState
    }
    case "EXCHANGE.SET_EXCHANGE_ENABLE":{
      if(!action.payload){
        newState.errors.exchange_enable = ""
      }else{
        newState.errors.exchange_enable = "error.exchange_enable"
      }
      return newState
    }
    case "EXCHANGE.UPDATE_BALANCE_DATA":{
      const {balanceData, hash} = action.payload
      if (hash === newState.txHash){
        newState.balanceData.sourceAmount = balanceData.srcAmount
        newState.balanceData.destAmount = balanceData.destAmount
      }
      return newState
    }
    case "EXCHANGE.SET_SELECTED_GAS":{
      const {level} = action.payload
      newState.selectedGas = level
      return newState
    }
    case "EXCHANGE.OPEN_IMPORT_ACCOUNT":{
      newState.isOpenImportAcount = true
      return newState
    }
    case "EXCHANGE.CLOSE_IMPORT_ACCOUNT":{
      newState.isOpenImportAcount = false
      return newState
    }
    case "EXCHANGE.INIT_PARAMS_EXCHANGE":{
      const {receiveAddr, receiveToken, tokenAddr, receiveAmount, callback, products, network,
        paramForwarding, signer, commissionID, isSwap, type, paymentData, hint, theme, getPrice, getTxData, wrapper} = action.payload
      newState.destTokenSymbol = receiveToken
      newState.destAmount = receiveAmount

      if (receiveAmount === null){
        newState.isHaveDestAmount = false
      }else{
        newState.isHaveDestAmount = true
      }

      newState.destToken = tokenAddr
      newState.receiveAddr = receiveAddr
      newState.products = products
      newState.callback = callback
      newState.network = network
      newState.paramForwarding = paramForwarding
      newState.signer = signer
      newState.commissionID = commissionID
      newState.isSwap = isSwap
      newState.type = type
      newState.paymentData = paymentData
      newState.hint = hint
      newState.theme = theme
      newState.getPrice = getPrice
      newState.getTxData = getTxData
      newState.wrapper = wrapper

      return newState
    }
    case "EXCHANGE.SET_APPROVE":{
      const {isNeedApprove} = action.payload;
      newState.isNeedApprove = isNeedApprove;
      return newState;
    }
    case "EXCHANGE.THROW_ERROR_EXCHANGE":{
      const {key, val} = action.payload
      var errors = {...newState.errors}
      errors[key] = val
      newState.errors = {...errors}
      return newState
    }
    case "EXCHANGE.VALIDATE_ACCOUNT_COMPLETE":{
      newState.validateAccountComplete = true
      return newState
    }
    case "EXCHANGE.SELECT_TOKEN_COMPLETE":{
      newState.isSelectToken = false
      return newState
    }
    case "EXCHANGE.UPDATE_RECEIVE_ADDRESS":{
      const {address} = action.payload
      newState.receiveAddr = address
      return newState
    }
    case "GLOBAL.CLEAR_SESSION_FULFILLED":{
      newState.step = 1;

      return newState;
    }
    case "EXCHANGE.UNSET_CONFIRMING": {
      newState.isConfirming = false;
      return newState
    }
    case "EXCHANGE.UPDATE_SOURCE_TOKEN":{
      var {sourceTokenSymbol, source} = action.payload
      newState.sourceTokenSymbol =sourceTokenSymbol
      newState.sourceToken =source
      return newState
    }
    case "EXCHANGE.CHANGE_DEFAULT_TOKEN":{
      var {sourceSymbol, sourceAddress, destSymbol, destAddress} = action.payload
      newState.sourceTokenSymbol = sourceSymbol
      newState.sourceToken = sourceAddress
      newState.destTokenSymbol = destSymbol
      newState.destToken = destAddress
      return newState
    }
    case "EXCHANGE.SET_SOURCE_AMOUNT": {
      newState.sourceAmount = action.payload;
      return newState;
    }
    case "EXCHANGE.SET_IS_APPROVE_ZERO":{
      newState.isApproveZero = action.payload;
      return newState;
    }
    case "EXCHANGE.SET_FLUCTUATING_RATE": {
      newState.fluctuatingRate = action.payload;
      return newState;
    }
    case "EXCHANGE.SET_SRC_AMOUNT_LOADING": {
      newState.isSrcAmountLoading = action.payload;
      return newState;
    }
    case "EXCHANGE.SET_DEST_AMOUNT_LOADING": {
      newState.isDestAmountLoading = action.payload;
      return newState;
    }
  }
  return state
}

export {initState, exchange} ;
