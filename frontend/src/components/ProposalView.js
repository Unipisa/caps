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
import AdminTools from './AdminTools';
import ShareButton from './ShareButton';

export class ProposalView extends CapsPage {
    constructor(props) {
        super(props);

        this.state = {...this.state,
            'proposal': null, 
            'user': null,
        };
    }

    async componentDidMount() {
        super.componentDidMount();
        this.loadProposal();
    }

    async loadProposal() {
        try {
            const proposal = await restClient.get(`proposals/${ this.props.id }`);
            this.setState({ proposal });
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
                    <AdminTools self={ this } items_name="proposals" />
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

export default ProposalView;