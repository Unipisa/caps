import React from "react";
import Card from "./Card";
import LoadingMessage from './LoadingMessage';
import ProposalInfo from "./ProposalInfo";
import FormInfo from "./FormInfo";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import AttachmentDocumentsBlock from "./AttachmentDocumentsBlock";

class UserProfile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            'user': undefined, 
            'proposals': undefined,
            'forms': undefined,
            'documents': undefined
        };
    }

    componentDidMount() {
        this.loadUserData();
    }

    async loadUserData() {
        const user_endpoint = this.props.root + 'users/view/' 
            + ((this.props.id == undefined) ? '' : this.props.id) + '.json';
        const user_data = await (await fetch(user_endpoint)).json();

        this.setState({
            'user': user_data['user']
        }, () => {
            this.loadProposals();
            this.loadForms();
            this.loadDocuments();
        })
    }

    async loadProposals() {
        const proposals_endpoint = this.props.root + 'users/proposals/' + this.state.user.id + '.json';
        const data = await (await fetch(proposals_endpoint)).json();

        this.setState({
            'proposals': data['proposals']
        });
    }

    async loadForms() {
        const forms_endpoint = this.props.root + 'users/forms/' + this.state.user.id + '.json';
        const data = await (await fetch(forms_endpoint)).json();

        this.setState({
            'forms': data['forms']
        });
    }

    async loadDocuments() {
        const documents_endpoint = this.props.root + 'users/documents/' + this.state.user.id + '.json';
        const data = await (await fetch(documents_endpoint)).json();

        this.setState({
            'documents': data['documents']
        });
    }

    async onProposalChanged(p) {
        this.loadProposals();
    }

    async onFormChanged(f) {
        this.loadForms();
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
            { (this.state.proposals !== undefined && this.state.proposals.length == 0) && <span>
                Nessun piano di studio presentato.
                </span> }
            { this.state.proposals !== undefined && 
            <div className="row">
                { this.state.proposals.map(
                    p => <ProposalInfo root={this.props.root} csrfToken={this.props.csrfToken} 
                        key={"proposal-info-" + p.id} proposal={p}
                        onChange={this.onProposalChanged.bind(this)}>
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

    render() {
        if (this.state.user == undefined) {
            return <Card><LoadingMessage>Loading the user profile</LoadingMessage></Card>;
        }
        else {
            return <div>
                {this.renderUserBlock()}
                {this.renderProposalsBlock()}
                {this.renderDocumentsBlock()}
                {this.renderFormsBlock()}
            </div>;
        }
    }
}

export default UserProfile;
