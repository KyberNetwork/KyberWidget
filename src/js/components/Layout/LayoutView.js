import React from "react"
import { Switch, Route, Redirect } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
import { Processing, InfoModal } from "../../containers/CommonElements/"
import constansts from "../../services/constants"
import * as common from "../../utils/common"
//import BLOCKCHAIN_INFO from "../../../../env"



// function getAllPathToken(network){
//   var tokens = []
//   Object.keys(BLOCKCHAIN_INFO.tokens).map(key => {
//     tokens.push(key)
//   })

//   var path = "("
//   for (var i = 0; i< tokens.length ; i++){
//     if (i === tokens.length -1){
//       path += tokens[i].toLowerCase() + "|" + tokens[i]
//     }else{
//       path += tokens[i].toLowerCase() + "|" + tokens[i] + "|"
//     }
//   }
//   path += ")"
//   return path
// }

const LayoutView = (props) => {
  //var listToken = getAllPathToken(props.network)
  var defaultPathExchange = constansts.BASE_HOST + constansts.PAYMENT_PATH

  var params = common.queryParamsString(window.location.href)
  if (props.currentLanguage !== "en"){
    defaultPathExchange += "?lang=" + props.currentLanguage
    Object.keys(params).map(key => {
      defaultPathExchange += `&${key}=${params[key]}` 
    })
  }else{
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
  
  // console.log("default_path")
  // console.log(defaultPathExchange)
  return (
    <ConnectedRouter history={props.history}>
      <div>
        <Route component={props.Header} />
        <section id="content">
          {props.paymentHeader}

          <Switch>
            {/* <Route exact path={constansts.BASE_HOST} component={props.ImportAccount} /> */}

            <Route exact path={constansts.BASE_HOST + constansts.PAYMENT_PATH} component={props.Exchange} />
            <Route exact path={constansts.BASE_HOST + constansts.PAYMENT_PATH +"*"} component={props.Exchange} />
            
            <Redirect to={defaultPathExchange} />
            
          </Switch>
          {/* <div id="rate-bar" class="mb-8">
            {props.rate}
          </div> */}
          
          <Processing />
         
          {/* <div id="footer">
            {props.footer}
          </div> */}
        </section>
        <section id="modals">
          <InfoModal />
        </section>
        {/* <section id="footer">
          {props.footer}
        </section> */}
      </div>
    </ConnectedRouter>
  )
}

export default LayoutView;
