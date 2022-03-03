import React from "react";
import Card from "./Card";
import LoadingMessage from './LoadingMessage';
import ProposalInfo from "./ProposalInfo";
import FormInfo from "./FormInfo";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import AttachmentDocumentsBlock from "./AttachmentDocumentsBlock";
import Proposals from "../models/proposals";
import Users from '../models/users';

class UserProfile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            'settings': undefined,
            'logged_user': null,
            'user': undefined, 
            'proposals': undefined,
            'forms': undefined,
            'documents': undefined,
            'flash': undefined
        };
    }

    componentDidMount() {
        this.loadStatus();
    }

    async loadStatus() {
        const status = await (await fetch(Caps.root + 'api/v1/status.json')).json();

        this.setState({
            'settings': status['settings'], 
            'logged_user': status['user']
        }, () => {
            this.loadUserData();
        })
    }

    async loadUserData() {
        this.setState({
            'user': await Users.get(this.props.id)
        }, () => {
            this.loadProposals();
            this.loadForms();
            this.loadDocuments();
        })
    }

    async loadProposals() {
        this.setState({
            'proposals': await Users.proposals(this.state.user.id)
        });
    }

    // FIXME: For forms and documents we should use model classes as for users 
    // and proposals, they are just not here yet.

    async loadForms() {
        const forms_endpoint = this.props.root + 'users/forms/' + this.state.user.id + '.json';
        const data = await (await fetch(forms_endpoint)).json();

        this.setState({
            'forms': data['forms']
        });
    }

    async loadDocuments() {
        if (! this.state.logged_user.admin) {
            return;
        }

        const documents_endpoint = this.props.root + 'users/documents/' + this.state.user.id + '.json';
        const data = await (await fetch(documents_endpoint)).json();

        this.setState({
            'documents': data['documents']
        });
    }

    async onFormChanged(f) {
        this.loadForms();
    }

    async onProposalDeleteClicked(p) {
        if (confirm('Cancellare il piano di studi selezionato?')) {
            const data = await Proposals.delete(p.props.proposal.id);

            if (data.code != 200) {
                this.setState({
                    'flash': { 'type': 'error', 'message': data.message }
                });
            }
            else {
                // Remove the proposal from the current state
                let proposals = this.state.proposals;
                proposals.splice(this.state.proposals.indexOf(p.props.proposal), 1);
                this.setState({
                    'proposals': proposals, 
                    'flash': { 'type': 'success', 'message': data.message }
                });
            }
        }
    }

    renderUserBlock() {
        return <div><Card className="border-left-primary">
            <h3>{this.state.user.name}</h3>
            <strong>Matricola: </strong> {this.state.user.number}<br></br>
            <strong>Email: </strong> {this.state.user.email}<br />
            </Card></div>;
    }

    renderProposalsBlock() {        
        return <div className="mt-4">
            <h2 className="d-flex">
                <span className="mr-auto">Piani di studio</span>
                <a href={this.props.root + 'proposals/edit'} className="my-auto btn btn-sm btn-primary shadow-sm">
                    <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
                    <span className="d-none d-md-inline ml-2">Nuovo piano di studio</span>
                </a>
            </h2>
            { this.state.proposals === undefined && <LoadingMessage>Caricamento dei piani in corso</LoadingMessage>}
            { (this.state.proposals !== undefined && this.state.proposals.length == 0) && <Card>
                Nessun piano di studio presentato.
                </Card> }
            { this.state.proposals !== undefined && 
            <div className="row">
                { this.state.proposals.map(
                    p => <ProposalInfo root={this.props.root} csrfToken={this.props.csrfToken} 
                        key={"proposal-info-" + p.id} proposal={p}
                        onDeleteClicked={this.onProposalDeleteClicked.bind(this)}>
                    </ProposalInfo>
                )
                }
            </div>
            }
        </div>
    }

    renderFormsBlock() {
        return <div className="mt-4">
            <h2 className="d-flex">
                <span className="mr-auto">Moduli</span>
                <a href={this.props.root + 'forms/edit'} className="my-auto btn btn-sm btn-primary shadow-sm">
                    <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
                    <span className="d-none d-md-inline ml-2">Nuovo modulo</span>
                </a>
            </h2>
            { this.state.forms === undefined && <LoadingMessage>Caricamento dei moduli in corso</LoadingMessage>}
            {
                this.state.forms !== undefined && <div>
                    { this.state.forms.length == 0 && <Card>Nessun modulo consegnato.</Card>}
                    <div className="row">{ this.state.forms.map(f => <FormInfo root={this.props.root} 
                        csrfToken={this.props.csrfToken} 
                        key={"form-info-" + f.id} 
                        onChange={this.onFormChanged.bind(this)}
                        form={f}></FormInfo>)
                    }</div>
                </div> 
            }
            
        </div>
    }

    renderDocumentsBlock() {
        if (! this.state.logged_user.admin)
            return;

        const blockTitle = "Documenti e allegati";

        return <div className="mt-2">
        { this.state.documents === undefined && <LoadingMessage>Caricamento dei documenti in corso</LoadingMessage>}
        {
            this.state.documents !== undefined && <div>
                { this.state.documents.length == 0 && <Card title={blockTitle}>Nessun documento archiviato.</Card>}
                { this.state.documents.length > 0 && 
                    <AttachmentDocumentsBlock root={this.props.root} 
                        controller="documents" 
                        title={blockTitle}
                        key="documents" 
                        attachments={this.state.documents} auths={[]}>
                    </AttachmentDocumentsBlock>
                }
            </div> 
        }
        
    </div>
    }

    hideFlash() {
        this.setState({ 'flash': undefined });
    }

    renderFlash() {
        let type = "success";
        let message = "";

        if (this.state.flash !== undefined) {
            message = this.state.flash.message;
            type = this.state.flash.type;
        }

        let className = "primary";

        switch (type) {
            case 'success':
                className = "success";
                break;
            case 'error':
                className = 'danger';
                break;
        }

        if (this.state.flash === undefined) {
            className += " d-none";
        }

        const elem = <Card className={`border-left-${className} mb-2`} onClick={this.hideFlash.bind(this)}>
            {message}
        </Card>;

        return elem;
    }

    render() {
        if (this.state.user == undefined) {
            return <Card><LoadingMessage>Loading the user profile</LoadingMessage></Card>;
        }
        else {
            return <div>
                {this.renderFlash()}
                {this.renderUserBlock()}
                {this.renderProposalsBlock()}
                {this.renderDocumentsBlock()}
                {this.renderFormsBlock()}
            </div>;
        }
    }
}

export default UserProfile;
