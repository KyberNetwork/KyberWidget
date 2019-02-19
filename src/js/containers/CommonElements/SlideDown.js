import React from "react";
import { addPrefixClass } from "../../utils/className";

export const SlideDownTrigger = (props) => (
  <div className={addPrefixClass("slide-down__trigger")} onClick={props.onToggleContent}>
    {props.children}
  </div>
);

export const SlideDownContent = (props) => (
  <div className={addPrefixClass("slide-down__content")}>
    <div className={addPrefixClass("slide-down__fade-in")}>
      {props.children}
    </div>
  </div>
);

const SlideDown = (props) => {
  return (
    <div className={addPrefixClass(`slide-down ${props.active ? 'slide-down--active' : ''}`)}>
      {props.children}
    </div>
  )
};

export default SlideDown;
