'use strict';

import restClient from '../modules/api';
import AttachmentDocumentsBlock from './AttachmentDocumentsBlock';
import React, { useState } from 'react';
import Card from './Card';
import LoadingMessage from './LoadingMessage';
import ProposalYear from './ProposalYear';
import CapsPage from './CapsPage';
import { proposalColor } from './StateBadge';
import { Dropdown, Button } from 'react-bootstrap';

export class ProposalView extends CapsPage {
    constructor(props) {
        super(props);

        this.state = {...this.state,
            'proposal': null, 
            'user': null,
        };
    }

    async componentDidMount() {
        this.loadProposal();
        this.loadUser();
    }

    async loadProposal() {
        try {
            const proposal = await restClient.get(`proposals/${ this.props.id }`);
            this.setState({ proposal });
        } catch(e) {
            this.flashCatch(e);
        }
    }

    async loadUser() {
        try {
            const status = await restClient.get(`status`);
            this.setState({ user: status.user });
        } catch(e) {
            this.flashCatch(e);
        }
    }

    async approve() {
        try {
            const proposal = await restClient.patch(
                `proposals/${this.state.proposal.id}`, 
                { state: "approved" })
            this.flashSuccess("Piano di studi approvato");
            this.setState({ proposal });
        } catch(e) {
            this.flashCatch(e);
        }
    }

    async reject() {
        try {
            const proposal = await restClient.patch(
                `proposals/${this.state.proposal.id}`, 
                { state: "rejected" })
            this.flashDanger("Piano di studi rigettato");
            this.setState({ proposal });
        } catch(e) {
            this.flashCatch(e);
        }
    }

    async share(email) {
        try {
            await restClient.post(`proposals/${this.state.proposal.id}/share`, { email });
            this.flashSuccess(`Inviata richiesta di commento a: ${email}`);
        } catch(e) {
            this.flashCatch(e);
        }
    }

    renderPage() {
        const proposal = this.state.proposal;
        if (proposal === null) return <LoadingMessage>
            Caricamento piano di studi...
        </LoadingMessage>

        return <>
            <h1>Piano di Studi di { proposal.user.name } </h1>
            <ProposalMessage proposal={proposal} />
            <Card>
                <div className="d-flex mb-2">
                    <AdminTools self={ this } />
                    <ShareButton self={ this } />
                </div>
                <p>TO BE COMPLETED...</p>
            </Card>
        </>
    }
}

function ProposalMessage({ proposal }) {
    const state = proposal.state;
    const degree = proposal.curriculum.degree;
    const message = {
        'approved': degree.approval_message,
        'submitted': degree.submission_message,
        'rejected': degree.rejection_message,
        'draft': "Questo piano di studi è una bozza"
    }[proposal.state];
    if (message) {
        return <Card className={ `border-left-${proposalColor(proposal)}` }>
            <div dangerouslySetInnerHTML={{__html: message }} />
        </Card>
    } else {
        return "";
    }
}

function AdminTools({ self }) {
    if (!self.state.user) return "";
    if (!self.state.user.admin) return "";
    if (self.state.proposal.state != 'submitted') return "";

    return <>
        <button type="button" 
            className="btn btn-sm btn-success mr-2"
            onClick={() => self.approve() }>
            <i className="fas fa-check" />
            <span className="d-none d-md-inline">Accetta</span>
        </button>
        <button type="button" 
            className="btn btn-sm btn-danger mr-2"
            onClick={() => self.reject() }>
            <i className="fas fa-times" /> 
            <span className="d-none d-md-inline">Rifiuta</span>
        </button>
    </>
}

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

export default ProposalView;