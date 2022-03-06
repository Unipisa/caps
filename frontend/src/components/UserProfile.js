import React from "react";
import Card from "./Card";
import LoadingMessage from './LoadingMessage';
import ProposalInfo from "./ProposalInfo";
import FormInfo from "./FormInfo";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import AttachmentDocumentsBlock from "./AttachmentDocumentsBlock";
import RestClient from "../modules/api";
import FormsBlock from "./FormsBlock";

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

    async componentDidMount() {
        this.loadStatus();
    }

    reportError(msg) {
        console.log(msg);
    }

    async loadStatus() {
        const status = await RestClient.status();

        this.setState({
            'settings': status['data']['settings'], 
            'logged_user': status['data']['user']
        }, () => {
            this.loadUserData();
        })
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
        const res = await RestClient.get('proposals', { 'user_id': this.state.user.id });

        if (res.code != 200) {
            console.log('Error while loading the proposals: ' + res.message);
        }
        else {
            this.setState({ 'proposals': res['data'] });
        }        
    }

    async loadForms() {
        const res = await RestClient.get('forms', { 'user_id': this.state.user.id });

        if (res.code != 200) {
            this.reportError(res.message);
        }
        else {
            this.setState({
                'forms': res.data
            });
        }
    }

    async loadDocuments() {
        if (! this.state.logged_user.admin) {
            return;
        }

        const res = await RestClient.get('documents', { 'user_id': this.state.user.id });

        this.setState({
            'documents': res['data']
        });
    }

    async onProposalDeleteClicked(p) {
        const data = await RestClient.delete(`proposals/${p.props.proposal.id}`);

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
                'flash': { 'type': 'success', 'message': "Il piano di studio è stato cancellato." }
            });
        }
    }

    async onFormDeleteClicked(f) {
        const data = await RestClient.delete(`forms/${f.props.form.id}`);

        if (data.code != 200) {
            this.setState({
                'flash': { 'type': 'error', 'message': data.message }
            });
        }
        else {
            let forms = this.state.forms;
            forms.splice(this.state.forms.indexOf(f.props.form), 1);
            this.setState({
                'forms': forms, 
                'flash': { 'type': 'success', 'message': "Il modulo è stato cancellato." }
            });
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
                <FormsBlock
                    forms={this.state.forms}
                    root={this.props.root}
                ></FormsBlock>
            </div>;
        }
    }
}

export default UserProfile;
