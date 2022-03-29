import React from "react";
import Card from "./Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function Flash(props) {
    let type = "success";
    let message = "";

    if (props.flash !== undefined) {
        message = props.flash.message;
        type = props.flash.type;
    }

    let className = "primary";

    switch (type) {
        case 'success':
            className = "success";
            break;
        case 'error':
            className = 'danger';
            break;
    }

    if (props.flash === undefined) {
        className += " d-none";
    }

    return <Card className={`border-left-${className} mb-2`} onClick={props.onClick}>
        <div className="d-flex align-middle">
            <div className="mr-auto">{message}</div>
            <div className="align-middle" style={{ cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
            </div>
        </div>
    </Card>;
}

export default Flash;