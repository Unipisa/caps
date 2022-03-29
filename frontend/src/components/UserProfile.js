import React from "react";
import Card from "./Card";
import LoadingMessage from './LoadingMessage';
import ProposalInfo from "./ProposalInfo";
import FormInfo from "./FormInfo";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AttachmentDocumentsBlock from "./AttachmentDocumentsBlock";
import RestClient from "../modules/api";
import FormsBlock from "./FormsBlock";
import Modal from "./Modal";
import UserDocumentsBlock from "./UserDocumentsBlock";
import Flash from "./Flash";
import ProposalsBlock from "./ProposalsBlock";

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
            'loadingDocument': false, 
            'flash': undefined
        };

        this.modal_ref = React.createRef();
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
        // Make sure that the user wants to delete the proposal
        this.modal_ref.current.show('Eliminare il piano di studi?', 
            'Eliminare definitivamente il piano di studi del Curriculum ' + p.props.proposal.curriculum.name + '?\n' + 
            'Questa operazione non è reversibile.', 
            async (response) => {
                if (response) {
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
        })
    }

    async onFormDeleteClicked(f) {
        this.modal_ref.current.show('Eliminare il modulo?', 
            'Eliminare il modulo definitivamente? Questa operazione non può essere annullata.', 
            async (response) => {
                if (response) {
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
            });
        
    }

    async onNewAttachment(a) {
        // The AttachmentBlock is not aware of the user we are adding the 
        // attachment to, hence we complement this informatino before actually 
        // sending the request to the server. 
        a['user_id'] = this.state.user.id;

        this.setState({
            loadingDocument: true
        }, async () => {
            const response = await RestClient.post('documents', a);        

            if (response.code != 200) {
                this.setState({
                    'flash': { 'type': 'error', 'message': response.message }, 
                    loadingDocument: false
                });
            }
            else {
                this.setState({
                    'documents': [...this.state.documents, response['data']], 
                    'flash': { 'type': 'success', 'message': 'Allegato aggiunto al profilo.' },
                    loadingDocument: false
                });
            }
        })

        
    }

    async onAttachmentDeleteClicked(a) {
        this.modal_ref.current.show('Eliminare il documento?', 
            'Questa operazione non è reversibile.', 
            async (response) => {
            if (response) {
                const data = await RestClient.delete(`documents/${a.id}`);
                if (data.code != 200) {
                    this.setState({
                        'flash': { 'type': 'error', 'message': data.message }
                    })
                }
                else {
                    let new_documents = this.state.documents;
                    new_documents.splice(new_documents.indexOf(a), 1);

                    this.setState({
                        'flash': { 'type': 'success', 'message': data.message },
                        'documents': new_documents
                    })
                }
            }
        });
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

    hideFlash() {
        this.setState({ 'flash': undefined });
    }

    render() {
        if (this.state.user == undefined) {
            return <Card><LoadingMessage>Loading the user profile</LoadingMessage></Card>;
        }
        else {
            return <div>
                <Modal ref={this.modal_ref}></Modal>
                <Flash flash={this.state.flash} onClick={this.hideFlash.bind(this)}></Flash>
                {this.renderUserBlock()}
                <ProposalsBlock className="mt-4"
                    root={this.props.root} 
                    proposals={this.state.proposals} 
                    onProposalDeleteClicked={this.onProposalDeleteClicked.bind(this)}>
                </ProposalsBlock>
                {this.state.forms && this.state.forms.length>0 &&
                <FormsBlock className="mt-4"
                    onDeleteClicked={this.onFormDeleteClicked.bind(this)}
                    forms={this.state.forms}
                    root={this.props.root}>
                </FormsBlock>}
                {this.state.logged_user.admin &&
                <UserDocumentsBlock className="mt-4"
                    root={this.props.root}
                ></UserDocumentsBlock>}
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
