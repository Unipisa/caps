import React from "react"

import Form from 'react-bootstrap/Form'

export default function Group({ controlId, label, validationError, children, ...controlProps }:{
    controlId: string,
    label: string,
    validationError?: string,
    children?: any,
    [key: string]: any,
}) {
    return (
        <Form.Group className="mb-3" controlId={controlId} >
        <Form.Label>{label}</Form.Label>
        {
            children === undefined
            ? <Form.Control
                {...controlProps}
                className={validationError ? "border border-danger" : ""}
            />
            : children
        }
        {validationError && <Form.Label className="mb-0 text-danger">{validationError}</Form.Label>}
        </Form.Group>
    );
}