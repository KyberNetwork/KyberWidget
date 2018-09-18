import React from "react"
import { Selector } from "../../containers/CommonElements"
import {addPrefixClass} from "../../utils/className"

export default class GasOption extends React.Component {
    changeGas = (value) => {
        this.props.onChange(value);
    }
    render() {
        return (
            <div className={addPrefixClass("gas-option")}>
                <Selector
                    defaultItem={this.props.focus}
                    listItem={this.props.gasOptions}
                    onChange = {this.changeGas}
                />
            </div>
        )
    }
}

