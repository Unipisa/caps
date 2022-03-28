import React from "react";
import Card from "./Card";
import LoadingMessage from './LoadingMessage';
import ProposalInfo from "./ProposalInfo";
import FormInfo from "./FormInfo";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import AttachmentDocumentsBlock from "./AttachmentDocumentsBlock";
import RestClient from "../modules/api";
import FormsBlock from "./FormsBlock";
import Modal from "./Modal";
import UserDocumentsBlock from "./UserDocumentsBlock";

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
            { (this.state.proposals !== undefined && this.state.proposals.length == 0) && <p>
                Nessun piano di studio presentato.
                </p> }
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
            <div className="d-flex align-middle">
                <div className="mr-auto">{message}</div>
                <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
            </div>
        </Card>;

        return elem;
    }

    render() {
        if (this.state.user == undefined) {
            return <Card><LoadingMessage>Loading the user profile</LoadingMessage></Card>;
        }
        else {
            return <div>
                <Modal ref={this.modal_ref}></Modal>
                {this.renderFlash()}
                {this.renderUserBlock()}
                {this.renderProposalsBlock()}
                <FormsBlock
                    onDeleteClicked={this.onFormDeleteClicked.bind(this)}
                    forms={this.state.forms}
                    root={this.props.root}
                ></FormsBlock>
                {this.state.logged_user.admin && <UserDocumentsBlock
                    loadingDocument={this.state.loadingDocument} 
                    documents={this.state.documents} 
                    onNewAttachment={this.onNewAttachment.bind(this)}
                    onDeleteClicked={this.onAttachmentDeleteClicked.bind(this)}
                    root={this.props.root}
                ></UserDocumentsBlock>}
            </div>;
        }
    }
}

export default UserProfile;
