import React from "react";
import { Modal } from "../CommonElement";
import { addPrefixClass } from "../../utils/className"

const InfoModal = (props) => {
  var content = (
    <div>
      <div className={addPrefixClass("k-title text-center")}>{props.title}</div>
      <a className={addPrefixClass("x")} onClick={props.closeModal}>&times;</a>
      <div className={addPrefixClass("k-content")}>
          <div className={addPrefixClass("row")}>
              <div className={addPrefixClass("column")}>
                  <center>
                      <p>{props.content}</p>
                  </center>
              </div>
          </div>
      </div>
    </div>
  )
  return (
    <Modal
      className={
      {
        base: 'reveal tiny',
        afterOpen: 'reveal tiny'
      }}
      content={content}
      isOpen={props.isOpen}
      onRequestClose={props.closeModal}
      size="tiny"
      contentLabel="Info modal"
      />
      
  )
}

export default InfoModal;
