import React from "react";
import Card from "./Card";
import LoadingMessage from './LoadingMessage';
import RestClient from "../modules/api";
import FormsBlock from "./FormsBlock";
import UserDocumentsBlock from "./UserDocumentsBlock";
import ProposalsBlock from "./ProposalsBlock";
import CapsPage from "./CapsPage";

class UserProfile extends CapsPage {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            'settings': undefined,
            'logged_user': null,
            'form_templates_enabled': null,
            'user': undefined, 
            'proposals': undefined,
            'forms': undefined,
            'documents': undefined,
            'loadingDocument': false, 
        };
    }

    async componentDidMount() {
        this.loadStatus();
    }

    async loadStatus() {
        const status = await RestClient.status();

        await this.setStateAsync({
            'settings': status['data']['settings'], 
            'logged_user': status['data']['user'],
            'form_templates_enabled': status['data']['form_templates_enabled']
        });
        this.loadUserData();
    }

    async loadUserData() {
        const user_id = this.props.id ? this.props.id : this.state.logged_user.id;
        const user = await RestClient.get(`users/${user_id}`);

        this.setState({
            'user': user['data']
        }, () => {
            this.loadProposals();
            this.loadForms();
            this.loadDocuments();
        })
    }

    async loadProposals() {
        try {
            const res = await this.get('proposals', { 'user_id': this.state.user.id });
            this.setState({ proposals: res.data });
        } catch(err) {
            this.flashError(err);
        }
    }

    async loadForms() {
        try {
            const res = await this.get('forms', { 'user_id': this.state.user.id });
            this.setState({ forms: res.data });
        } catch(err) {
            this.flashError(err);
        }
    }

    async loadDocuments() {
        try {
            const res = await this.get('documents', { 'user_id': this.state.user.id });
            this.setState({ documents: res.data });
        } catch(err) {
            this.flashError(err);
        }
    }

    async onProposalDeleteClicked(p) {
        // Make sure that the user wants to delete the proposal
        if (!await this.confirm('Eliminare il piano di studi?', 
            `Eliminare definitivamente il piano di studi 
            del Curriculum ${p.props.proposal.curriculum.name}?
            Questa operazione non è reversibile.`)) return;

        try {
            const data = await this.delete(`proposals/${p.props.proposal.id}`);

            // Remove the proposal from the current state
            let proposals = this.state.proposals;
            proposals.splice(this.state.proposals.indexOf(p.props.proposal), 1);
            this.flashSuccess("Il piano di studio è stato cancellato.");
            this.setState({proposals});
        } catch(err) {
            this.flashError(err)
        }
    }

    async onFormDeleteClicked(f) {
        if (!await this.confirm('Eliminare il modulo?', 
            `Eliminare il modulo definitivamente? 
             Questa operazione non può essere annullata.`)) return;
        try { 
            const data = await this.delete(`forms/${f.props.form.id}`);

            let forms = this.state.forms;
            forms.splice(this.state.forms.indexOf(f.props.form), 1);
            this.flashSuccess("Il modulo è stato cancellato.");
            this.setState({forms});
        } catch(err) {
            this.flashError(err);
        }
    }

    async onNewAttachment(attachment) {
        // The AttachmentBlock is not aware of the user we are adding the 
        // attachment to, hence we complement this informatino before actually 
        // sending the request to the server. 
        attachment['user_id'] = this.state.user.id;
        await this.setStateAsync({
            loadingDocument: true
        });
        try {
            const response = await this.post('documents', attachment);        
            this.flashSuccess('Allegato aggiunto al profilo.');
            this.setState({
                'documents': [...this.state.documents, response['data']], 
            });
        } catch(err) {
            this.flashError(err);
        } finally {
            this.setState({ 
                loadingDocument: false 
            });
        }
    }

    async onAttachmentDeleteClicked(a) {
        if (!await this.confirm('Eliminare il documento?', 
            'Questa operazione non è reversibile.')) return;
        try { 
            const data = await this.delete(`documents/${a.id}`);
                let new_documents = this.state.documents;
                new_documents.splice(new_documents.indexOf(a), 1);
                this.flashSuccess(data.message);
                this.setState({
                    'documents': new_documents
                });
        } catch(err) {
            this.flashError(err);
        }
    }

    renderUserBlock() {
        return <>
            <Card className="border-left-primary">
                <h3>
                    {this.state.user.name}
                    <span className="d-none d-md-inline h5 text-muted ml-2">matricola: {this.state.user.number}</span>
                </h3>
                <h5 className="d-md-none text-muted">matricola: {this.state.user.number}</h5>
                <p className="mt-4" dangerouslySetInnerHTML={{
                    __html: this.state.settings['user-instructions']
                }}></p>
            </Card>
        </>;
    }

    renderPage() {
        if (this.state.user == undefined) {
            return <Card><LoadingMessage>Loading the user profile</LoadingMessage></Card>;
        }
        else {
            return <div>
                {this.renderUserBlock()}
                <ProposalsBlock className="mt-4"
                    root={this.props.root} 
                    proposals={this.state.proposals} 
                    onProposalDeleteClicked={this.onProposalDeleteClicked.bind(this)}>
                </ProposalsBlock>
                {(this.state.form_templates_enabled || (this.state.forms && this.state.forms.length>0))&&
                <FormsBlock className="mt-4"
                    onDeleteClicked={this.onFormDeleteClicked.bind(this)}
                    forms={this.state.forms}
                    root={this.props.root}
                    form_templates_enabled={this.state.form_templates_enabled}>
                </FormsBlock>}
                {this.state.logged_user.admin && <UserDocumentsBlock className="mt-4"
                    loadingDocument={this.state.loadingDocument} 
                    documents={this.state.documents} 
                    onNewAttachment={this.onNewAttachment.bind(this)}
                    onDeleteClicked={this.onAttachmentDeleteClicked.bind(this)}
                    root={this.props.root}>
                </UserDocumentsBlock>}
            </div>;
        }
    }
}

export default UserProfile;
