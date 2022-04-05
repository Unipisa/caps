import React from "react";
import Card from "./Card";
import LoadingMessage from './LoadingMessage';
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

        this.decorateCatchAndBind(
            "loadStatus",
            "onAttachmentDeleteClicked",
            "loadUserData",
            "loadProposals",
            "loadForms",
            "loadDocuments",
            "onProposalDeleteClicked",
            "onFormDeleteClicked",
            "onNewAttachment",
            "onAttachmentDeleteClicked"
            );
    }

    async componentDidMount() {
        this.loadStatus();
    }

    async loadStatus() {
        const status = await this.get("status");

        await this.setStateAsync({
            'settings': status.settings, 
            'logged_user': status.user,
            'form_templates_enabled': status.form_templates_enabled
        });

        this.loadUserData();
    }

    async loadUserData() {
        const user_id = this.props.id ? this.props.id : this.state.logged_user.id;
        const user = await this.get(`users/${user_id}`);

        await this.setStateAsync({ user });
        this.loadProposals();
        this.loadForms();
        this.loadDocuments();
    }

    async loadProposals() {
        const proposals = await this.get('proposals', { 'user_id': this.state.user.id });
        this.setState({ proposals });
    }

    async loadForms() {
        const forms = await this.get('forms', { 'user_id': this.state.user.id });
        this.setState({ forms });
    }

    async loadDocuments() {
        const documents = await this.get('documents', { 'user_id': this.state.user.id });
        this.setState({ documents });
    }

    async onProposalDeleteClicked(p) {
        // Make sure that the user wants to delete the proposal
        if (!await this.confirm('Eliminare il piano di studi?', 
            `Eliminare definitivamente il piano di studi 
            del Curriculum ${p.props.proposal.curriculum.name}?
            Questa operazione non è reversibile.`)) return;

        await this.delete(`proposals/${p.props.proposal.id}`);

        // Remove the proposal from the current state
        let proposals = this.state.proposals;
        proposals.splice(this.state.proposals.indexOf(p.props.proposal), 1);
        this.flashSuccess("Il piano di studio è stato cancellato.");
        this.setState({proposals});
    }

    async onFormDeleteClicked(f) {
        if (!await this.confirm('Eliminare il modulo?', 
            `Eliminare il modulo definitivamente? 
             Questa operazione non può essere annullata.`)) return;
        await this.delete(`forms/${f.props.form.id}`);

        let forms = this.state.forms;
        forms.splice(this.state.forms.indexOf(f.props.form), 1);
        this.flashSuccess("Il modulo è stato cancellato.");
        this.setState({forms});
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
            const document = await this.post('documents', attachment);        
            this.flashSuccess('Allegato aggiunto al profilo.');
            this.setState({
                'documents': [...this.state.documents, document], 
            });
        } catch(err) {
            throw(err); // managed by CapsPage envelope
        } finally {
            this.setState({ 
                loadingDocument: false 
            });
        }
    }

    async onAttachmentDeleteClicked(a) {
        if (!await this.confirm('Eliminare il documento?', 
            'Questa operazione non è reversibile.')) return;
        await this.delete(`documents/${a.id}`);
        let documents = this.state.documents.filter(d => d!==a);
        this.flashSuccess('Allegato rimosso.');
        this.setState({ documents });
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
