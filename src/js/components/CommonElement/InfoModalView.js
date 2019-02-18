import React from "react";
import { Modal } from "../CommonElement";
import { addPrefixClass } from "../../utils/className"

const InfoModalView = (props) => {
  var content = (
    <div className={addPrefixClass("modal-error")}>
      <div className={addPrefixClass("modal-error__header")}>{props.title}</div>
      <div className={addPrefixClass("modal-error__content")}>{props.content}</div>
    </div>
  );

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
};

export default InfoModalView;
