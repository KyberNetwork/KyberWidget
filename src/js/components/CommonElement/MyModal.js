import React from "react"
import Modal from 'react-modal'
import {addPrefixClass} from "../../utils/className"

const MyModal = (props) => {
    let customStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(11, 15, 26, 0.6)',
            zIndex: '1005',
            overflowY: 'auto'
        },
        content: {
            display: 'block',
        }
    }
    return (
        <Modal
            className={{
                base: addPrefixClass(props.className.base + " react-modal"),
                afterOpen: addPrefixClass(props.className.afterOpen + ' modal-open'),
                beforeClose:""
            }}
            style={customStyles}
            isOpen={props.isOpen}
            onRequestClose={props.onRequestClose}
            contentLabel={props.contentLabel}
        >
            {props.content}
        </Modal>

    )

}

export default MyModal