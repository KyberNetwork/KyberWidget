import React from "react"
import { Switch, Route, Redirect } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
import { Processing, InfoModal } from "../../containers/CommonElements/"
import constant from "../../services/constants"
import * as common from "../../utils/common"
import {addPrefixClass} from "../../utils/className"

const LayoutView = (props) => {
  var defaultPathExchange = constant.BASE_HOST + constant.PAYMENT_PATH

  var params = common.queryParamsString(window.location.href)
  if (props.currentLanguage !== "en"){
    defaultPathExchange += "?lang=" + props.currentLanguage
    Object.keys(params).map(key => {
      defaultPathExchange += `&${key}=${params[key]}`
    })
  } else {
    var index = 0
    Object.keys(params).map(key => {
      if (index === 0){
        defaultPathExchange += `?${key}=${params[key]}`
      }else{
        defaultPathExchange += `&${key}=${params[key]}`
      }
      index ++
    })
  }

  return (
    <ConnectedRouter history={props.history}>
      <div>
        <Route/>
        <section className={`widget-container ${props.theme}`}>
          {props.paymentHeader}

          <Switch>
            <Route exact path={constant.BASE_HOST + constant.PAYMENT_PATH} component={props.Exchange} />
            <Route exact path={constant.BASE_HOST + constant.PAYMENT_PATH +"*"} component={props.Exchange} />
            <Redirect to={defaultPathExchange} />
          </Switch>

          <Processing />
        </section>

        <div className={addPrefixClass("widget-footer")}/>

        <section id="modals">
          <InfoModal />
        </section>
      </div>
    </ConnectedRouter>
  )
}

export default LayoutView;
