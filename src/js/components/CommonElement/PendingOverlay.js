import React from "react"
import {addPrefixClass} from "../../utils/className"

const PendingOverlay = (props)=> {
  return (
      props.isEnable ? <div id="waiting" className={addPrefixClass("pending")}></div> : ''
  )
};

export default PendingOverlay
