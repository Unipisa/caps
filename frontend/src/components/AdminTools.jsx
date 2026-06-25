'use strict'

import React, { useState } from 'react'

function AdminTools({ self, items_name }) {
    const [email, setEmail] = useState("")

    if (!self.state.user) return "";
    if (!self.state.user.admin) return "";
    const field_name = {"proposals": "proposal", "forms": "form"}[items_name]
    if (field_name === undefined) throw new Error("invalid items_name")
    const item = self.state[field_name]
    if (!item || item.state != 'submitted') return ""

    return <>
        <button type="button" 
            className="btn btn-sm btn-success mr-2"
            onClick={() => self.onSetState("approved", "approvato") }>
            <i className="fas fa-check" />
            <span className="d-none d-md-inline">Accetta</span>
        </button>
        <button type="button" 
            className="btn btn-sm btn-danger mr-2"
            onClick={() => self.onSetState("rejected", "rifiutato") }>
            <i className="fas fa-times" /> 
            <span className="d-none d-md-inline">Rifiuta</span>
        </button>
        <div className="dropdown">
        <button type="button" className="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown">
            Richiedi parere
        </button>
        <div className="dropdown-menu p-3" style={{min_width: "450px"}}>
            <form onSubmit={ (evt) => {
                    evt.preventDefault()
                    self.share(email)
                } } acceptCharset="utf-8">
                <div className="input form-group" email="" required="">
                    <label htmlFor="email">Email</label>
                    <input className="form-control" type="email" name="email" value={email} onChange={evt => setEmail(evt.target.value)} required="required" data-validity-message="This field cannot be left empty" id="email" aria-required="true" maxLength="255" />
                </div>
                <input type="submit" className="btn btn-primary" value="Richiedi parere" />
            </form>        
        </div>
        </div>
    </>
}

export default AdminTools;
