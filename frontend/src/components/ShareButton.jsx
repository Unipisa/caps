import React, { useState } from 'react';

function canShare(proposal, user) {
    switch (proposal.curriculum.degree.enable_sharing) {
        case 0:
            return false;
        case 1:
            return (user.admin || user.id == proposal.user.id) && proposal.state == 'submitted';
        case 2:
            return user.admin;
        default:
            return false;
    }
}

function ShareButton({ self }) {
    const [email, setEmail] = useState("");
    const [open, setOpen] = useState(false);
    if (!self.state.user) return "";
    if (!self.state.proposal) return "";
    if (!canShare(self.state.proposal, self.state.user)) return "";

    function submit() {
        self.share(email);
        setEmail("");
        setOpen(false);
    }

    return  <Dropdown show={ open }>
        <Dropdown.Toggle onClick={ () => setOpen(!open)}>Richiedi parere</Dropdown.Toggle>
        <Dropdown.Menu className="p-3" style={{minWidth: "450px", margin: 0}}>
            <label htmlFor="share_email">Email</label>
            <input className="form-control"
                name="share_email"
                value={ email } 
                onChange={ (e) => setEmail(e.target.value) }
                />
            <Button onClick={ submit }>invia richiesta</Button>
        </Dropdown.Menu>
    </Dropdown>
}

export default ShareButton;