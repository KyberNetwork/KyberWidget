import React from "react"
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import { connect } from "react-redux"
import {addPrefixClass} from "../../utils/className"

@connect((store) => {
  return {
    analytics: store.global.analytics
  }
})

export default class PathSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      list: props.listItem,
      onChange: props.choosePath ? props.choosePath : null,
      walletType: props.walletType,
    }
  }

  showSelector = (e) => {
    this.setState({ open: true })
  }

  hideSelector = (e) => {
    this.setState({ open: false })
  }

  selectItem = (e, index) => {
    var path = this.state.list[index].path
    var desc = this.state.list[index].desc
    this.props.analytics.callTrack("clickChooseNewPathColdWallet", path, this.state.walletType)
    this.setState({
      focus: { name: path },
      open: false,
      currentDPath: path,
      description: desc
    })
    if (this.state.onChange) this.state.onChange(path)
  }

  focusItem = () => {
    return (this.props.listItem).map((dPath, index) => {
      if (dPath.path === this.props.currentDPath) {
        var description = dPath.desc;
        let path = dPath.defaultP;

        if (dPath.path) {
          path = dPath.path;
        }

        return <div key={index}><span className={addPrefixClass("focus-item__bold-text")}>{path}</span> - {description}</div>
      }
    })
  }

  handleSelectDerivationPath = (e, dPath, index) => {
    if (dPath.path === this.props.currentDPath) {
      this.setState({
        open: false
      })
    } else if (dPath.path) {
      this.selectItem(e, index)
    }
  };

  handleSelectAddress = (dPath) => {
    if (dPath.path === this.props.currentDPath) {
      this.setState({
        open: false
      })
    } else if (this.state.onChange) {
      this.setState({
        open: false
      });
      this.state.onChange(dPath.path)
    }
  };

  getListItem = () => {
    return (this.state.list).map((dPath, index) => {
      let disabledPath = (this.state.walletType == 'ledger' && dPath.notSupport) ? true : false
      if (!disabledPath) {
        return (
          <div
            key={dPath + index}
            className={addPrefixClass("address-selector__item " + (this.props.currentDPath === dPath.path ? 'address-selector__item--active' : ''))}
            onClick={(e) => this.handleSelectDerivationPath(e, dPath, index)}
          >
            {dPath.path !== 0 && (
              <div>
                <div className="name">{dPath.path}</div>
                <div className="note">{dPath.desc}</div>
              </div>
            )}

            {!dPath.path && (
              <div className={addPrefixClass("input-custom-path theme-border")}>
                <div>
                  <input
                    id="form-input-custom-path"
                    type="text"
                    name="customPath"
                    defaultValue={dPath.defaultP}
                    placeholder="Your Custom Path"
                    onFocus={() => this.props.analytics.callTrack("clickFocusToInPutNewPathColdWallet", this.state.walletType)}
                  />
                  <div className={addPrefixClass("common__arrow right")} onClick={() => this.handleSelectAddress(dPath)}/>
                </div>
              </div>
            )}
          </div>
        )
      }
    })
  };

  render() {
    return (
      <div className={addPrefixClass("token-selector")}>
        <Dropdown onShow={(e) => this.showSelector(e)} onHide={(e) => this.hideSelector(e)} active={this.state.open}>
          <DropdownTrigger className={addPrefixClass("notifications-toggle")}>
            <div className={addPrefixClass("focus-item d-flex theme-border")}>
              <div>{this.focusItem()}</div>
              <div className={addPrefixClass("common__arrow")}/>
            </div>
          </DropdownTrigger>
          <DropdownContent>
            <div className={addPrefixClass("select-item theme-border")}>
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
