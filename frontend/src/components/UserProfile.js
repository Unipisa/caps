import React from "react";
import Card from "./Card";
import LoadingMessage from './LoadingMessage';
import FormsBlock from "./FormsBlock";
import DocumentsBlock from "./DocumentsBlock";
import ProposalsBlock from "./ProposalsBlock";
import CapsPage from "./CapsPage";
import restClient from "../modules/api";

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
        try {
            const status = await restClient.get("status");

            await this.setStateAsync({
                'settings': status.settings, 
                'logged_user': status.user,
                'form_templates_enabled': status.form_templates_enabled
            });
            this.loadUserData();
        } catch (err) {
            this.flashCatch(err);
        }
    }

    async loadUserData() {
        try {
            const user_id = this.props.id ? this.props.id : this.state.logged_user.id;
            const user = await restClient.get(`users/${user_id}`);

            await this.setStateAsync({ user });
            this.loadProposals();
            this.loadForms();
            this.loadDocuments();
        } catch (err) {
            this.flashCatch(err);
        }
    }

    async loadProposals() {
        try {
            let proposals = await restClient.get('proposals', { 
                'user_id': this.state.user.id,
                '_sort': 'modified', 
                '_direction': 'desc'
            });
            this.setState({ proposals });
        } catch (err) {
            this.flashCatch(err);
        }
    }

    async loadForms() {
        try {
            const forms = await restClient.get('forms', { 
                'user_id': this.state.user.id,
                '_sort': 'modified', 
                '_direction': 'desc'
            });
            this.setState({ forms });
        } catch(err) {
            this.flashCatch(err);
        }
    }

    async loadDocuments() {
        try {
            const documents = await restClient.get('documents', { 'user_id': this.state.user.id });
            this.setState({ documents });
        } catch(err) {
            this.flashCatch(err);
        }
    }

    async onProposalDeleteClicked(p) {
        try {
            // Make sure that the user wants to delete the proposal
            if (!await this.confirm('Eliminare il piano di studi?', 
                `Eliminare definitivamente il piano di studi 
                del Curriculum ${p.props.proposal.curriculum.name}?
                Questa operazione non è reversibile.`)) return;

            await restClient.delete(`proposals/${p.props.proposal.id}`);

            // Remove the proposal from the current state
            let proposals = this.state.proposals;
            proposals.splice(this.state.proposals.indexOf(p.props.proposal), 1);
            this.flashMessage("Il piano di studio è stato cancellato.");
            this.setState({proposals});
        } catch(err) {
            this.flashCatch(err);
        }
    }

    async onFormDeleteClicked(f) {
        try {
            if (!await this.confirm('Eliminare il modulo?', 
                `Eliminare il modulo definitivamente? 
                Questa operazione non può essere annullata.`)) return;

            await restClient.delete(`forms/${f.props.form.id}`);

            let forms = this.state.forms;
            forms.splice(this.state.forms.indexOf(f.props.form), 1);
            this.flashMessage("Il modulo è stato cancellato.");
            this.setState({forms});
        } catch(err) {
            this.flashCatch(err);
        }
    }

    async onNewAttachment(attachment) {
        try {
            // The AttachmentBlock is not aware of the user we are adding the 
            // attachment to, hence we complement this informatino before actually 
            // sending the request to the server. 
            attachment['user_id'] = this.state.user.id;
            await this.setStateAsync({
                loadingDocument: true
            });
            const document = await restClient.post('documents', attachment);        
            this.flashSuccess('Allegato aggiunto al profilo.');
            this.setState({
                'documents': [...this.state.documents, document], 
            });
        } catch(err) {
            this.flashCatch(err);
        } finally {
            this.setState({ 
                loadingDocument: false 
            });
        }
    }

    async onAttachmentDeleteClicked(a) {
        try {
            if (!await this.confirm('Eliminare il documento?', 
                'Questa operazione non è reversibile.')) return;
            await restClient.delete(`documents/${a.id}`);
            let documents = this.state.documents.filter(d => d!==a);
            this.flashMessage('Allegato rimosso.');
            this.setState({ documents });
        } catch(err) {
            this.flashCatch(err);
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
        const info_text = "I documenti e le annotazioni inserite in questa sezione sono associate allo studente, ma sono visibili solo per gli amministratori.";

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
                {this.state.logged_user.admin && 
                <>
                <h2>Documenti e allegati</h2>
                <DocumentsBlock className="mt-4"
                    loadingDocument={this.state.loadingDocument} 
                    documents={this.state.documents} 
                    onNewAttachment={this.onNewAttachment.bind(this)}
                    onDeleteClicked={this.onAttachmentDeleteClicked.bind(this)}
                    root={this.props.root}
                    info_text={info_text}
                    controller="documents"
                    >
                </DocumentsBlock>
                </>
                }
            </div>;
        }
    }
}

export default UserProfile;
