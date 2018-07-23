
import React from "react"
import { connect } from "react-redux"


@connect((store) => {
    return {
        global: store.global
    }
})

export default class ErrorPayment extends React.Component {

    getErrorPayment = () => {

        return Object.keys(this.props.global.errorsPayment).map(key => {
            return <div key={key}>{this.props.global.errorsPayment[key]}</div>
        })
    }

    render = () => {

        return (
            <div>
                {this.getErrorPayment()}
            </div>
        )
    }
}