import React from "react";
import Card from "./Card";
import LoadingMessage from './LoadingMessage';
import ProposalInfo from "./ProposalInfo";
import FormInfo from "./FormInfo";

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

    renderUserBlock() {
        return <h1>{this.state.user.name}
            <span className="text-muted h5 ml-2">
                matricola: {this.state.user.number}
            </span>
        </h1>;
    }

    renderProposalsBlock() {        
        return <Card>
            <h2>Piani di studio</h2>
            { this.state.proposals === undefined && <LoadingMessage>Caricamento dei piani in corso</LoadingMessage>}
            { (this.state.proposals !== undefined && this.state.proposals.length == 0) && <span>
                Nessun piano di studio presentato.
                </span> }
            { this.state.proposals !== undefined && 
            <div className="row">
                { this.state.proposals.map(
                    p => <ProposalInfo root={this.props.root} 
                        key={"proposal-info-" + p.id} proposal={p}
                        onChange={this.onProposalChanged.bind(this)}>
                    </ProposalInfo>
                )
                }
            </div>
            }
        </Card>
    }

    renderFormsBlock() {
        return <Card>
            <h2>Moduli</h2>
            { this.state.forms === undefined && <LoadingMessage>Caricamento dei moduli in corso</LoadingMessage>}
            {
                this.state.forms !== undefined && <div className="row">
                    { this.state.forms.length == 0 && <div class="col-12">Nessun modulo consegnato.</div>}
                    { this.state.forms.map(f => <FormInfo root={this.props.root} key={"form-info-" + f.id} form={f}></FormInfo>)}
                </div> 
            }
            
        </Card>
    }

    renderDocumentsBlock() {
        return <Card>
        <h2>Documenti</h2>
        { this.state.documents === undefined && <LoadingMessage>Caricamento dei documenti in corso</LoadingMessage>}
        {
            this.state.documents !== undefined && <div>
                { this.state.documents.length == 0 && "Nessun documento archiviato."}
            </div> 
        }
        
    </Card>
    }

    render() {
        if (this.state.user == undefined) {
            return <Card><LoadingMessage>Loading the user profile</LoadingMessage></Card>;
        }
        else {
            return <div>
                {this.renderUserBlock()}
                {this.renderProposalsBlock()}
                {this.renderFormsBlock()}
                {this.renderDocumentsBlock()}
            </div>;
        }
    }
}

export default UserProfile;