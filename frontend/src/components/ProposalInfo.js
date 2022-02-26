import React from "react";
import SmallCard from "./SmallCard";
import { formatDate } from '../modules/dates';
import { postLink } from '../modules/form-submission';

class ProposalInfo extends React.Component {

    async onDeleteClicked() {
        if (confirm('Cancellare il piano di studi selezionato?')) {
            let delete_endpoint = this.props.root + 'proposals/delete/' + this.props.proposal.id;

            const res = await fetch(delete_endpoint, { method: 'POST', mode: 'cors' });

            if (this.props.onChange !== undefined) {
                this.props.onChange(this);
            }
        }
    }

    renderStateBadge() {
        if (this.props.proposal.state == "draft") {
            return <span className="badge badge-sm badge-secondary">Bozza</span>;
        }
        if (this.props.proposal.state == "submitted") {
            return <span className="badge badge-sm badge-warning">Sottomesso il {formatDate(this.props.proposal.submitted_date)}</span>;
        }
        if (this.props.proposal.state == "approved") {
            return <span className="badge badge-sm badge-success">Approvato il {formatDate(this.props.proposal.approved_date)}</span>;
        }
        if (this.props.proposal.state == "rejected") {
            return <span className="badge badge-sm badge-danger">Rigettato il {formatDate(this.props.proposal.modified)}</span>;
        }
    }

    renderButtons() {
        return <div className="btn-group float-right">
            <a href={`${this.props.root}proposals/view/${this.props.proposal.id}`}className="btn btn-sm btn-success">Visualizza</a>
            {this.props.proposal.state == "draft" && 
                <a href={`${this.props.root}proposals/edit/${this.props.proposal.id}`} className="btn btn-sm btn-primary">Modifica</a>
            }
            {this.props.proposal.state == "draft" && 
                <a className="btn btn-sm btn-danger" onClick={this.onDeleteClicked.bind(this)}>Elimina</a>
            }
        </div>
    }

    renderDatesBlock() {
        return <div className="text-muted small">
            Ultima modifica: {formatDate(this.props.proposal.modified)}
        </div>
    }

    render() {
        const proposal = this.props.proposal;

        return <div className="my-2 col-xxl-3 col-xl-4 col-lg-6 col-12">
            <SmallCard title={proposal.curriculum.degree.name}>
                <div className="mb-2">{this.renderStateBadge()}</div>
                <div><strong>{"Curriculum: " + proposal.curriculum.name}</strong></div>
                <div className="small text-muted">Regolamento dell'anno accademico {proposal.curriculum.degree.academic_year}/{proposal.curriculum.degree.academic_year+1}</div>
                {this.renderDatesBlock()}
                <div className="mt-3">
                    {this.renderButtons()}
                </div>
            </SmallCard></div>;
    }

}

export default ProposalInfo;