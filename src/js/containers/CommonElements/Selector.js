import React from "react"
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import { addPrefixClass } from "../../utils/className"

export default class Selector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      focus: { value: props.defaultItem, name: props.listItem[props.defaultItem] },
      list: props.listItem,
      onChange: props.onChange ? props.onChange : null
    }
  }

  showSelector = (e) => {
    this.setState({ open: true })
  }

  hideSelector = (e) => {
    this.setState({ open: false })
  }

  selectItem = (e, value) => {
    var name = this.state.list[value]
    this.setState({
      focus: { value: value, name: name },
      open: false
    })
    if (this.state.onChange) this.state.onChange(value)
  }

  getListItem = () => {
    return Object.keys(this.state.list).map((key, i) => {
      return (
        <div key={key} onClick={(e) => this.selectItem(e, key)} className={addPrefixClass("token-item")}>
          {this.state.list[key]}
        </div>
      )
    })
  }

  render() {
    return (
      <div className={addPrefixClass("token-selector")}>
        <Dropdown onShow={(e) => this.showSelector(e)} onHide={(e) => this.hideSelector(e)} active={this.state.open}>
          <DropdownTrigger className={addPrefixClass("notifications-toggle")}>
            <div className={addPrefixClass("focus-item d-flex")}>
              <div>{this.state.focus.name}</div>
            </div>
          </DropdownTrigger>
          <DropdownContent>
            <div className={addPrefixClass("select-item")}>
              <div className={addPrefixClass("list-item custom-scroll")}>
                {this.getListItem()}
              </div>
            </div>
          </DropdownContent>
        </Dropdown>
      </div>
    )
  }
}
