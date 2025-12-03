import React from "react";
import Card from "./Card";
import FA from "react-fontawesome";

export interface FlashMessage {
    type: 'error' | 'success' | 'info';
    message: string;
}

export function FlashCard({className, message, onClick}:{
    className: string,
    message: string,
    onClick?: () => void
}) {
    return <Card className={`border-left-${className} mb-2`} onClick={onClick?onClick:()=>{}}>
        <div className="d-flex align-middle">
            <div className="mr-auto">{message}</div>
            <div className="align-middle" style={{ cursor: 'pointer' }}>
                <FA name="fa-times" />
            </div>
        </div>
    </Card>;
}

export default function Flash({ messages, onClick }:{
    messages: FlashMessage[],
    onClick?: () => void
}) {
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
            />)
}
