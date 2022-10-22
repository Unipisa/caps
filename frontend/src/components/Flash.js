import React from "react";
import Card from "./Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function FlashCard({className, message, onClick}) {
    return <Card className={`border-left-${className} mb-2`} onClick={onClick}>
        <div className="d-flex align-middle">
            <div className="mr-auto">{message}</div>
            <div className="align-middle" style={{ cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
            </div>
        </div>
    </Card>;
}

function Flash({ messages, onClick }) {
    function classForType(type) {
        switch(type) {
            case 'error': return "danger";
            case 'success': return "success";
            default: return "primary";
        }
    }

    return messages.map((message, i) => 
        <FlashCard 
            key={i}
            className={ classForType(message.type) }
            message={ message.message }
            onClick={ onClick }
            >
        </FlashCard>);
}

export default Flash;