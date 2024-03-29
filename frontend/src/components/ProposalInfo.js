import React from "react";
import SmallCard from "./SmallCard";
import { formatDate } from '../modules/dates';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faEdit, faCopy } from '@fortawesome/free-solid-svg-icons'
import { ProposalStateBadge } from "./StateBadge";


class ProposalInfo extends React.Component {

    async onDeleteClicked(evt) {
        if (this.props.onDeleteClicked !== undefined) {
            this.props.onDeleteClicked(this);
        }
        evt.stopPropagation();
    }

    renderButtons() {
        return <div className="btn-group">
            {this.props.proposal.state == "draft" && 
                <a onClick={(e) => e.stopPropagation()} href={`${this.props.root}proposals/edit/${this.props.proposal.id}`} className="btn btn-sm btn-primary">
                    <FontAwesomeIcon icon={faEdit} />
                </a>
            }
            {this.props.proposal.state != "draft" &&
            <a onClick={(e) => e.stopPropagation()} href={`${this.props.root}proposals/duplicate/${this.props.proposal.id}`} className="btn btn-sm btn-primary">
                <FontAwesomeIcon icon={faCopy} />
            </a>}
            {this.props.proposal.state == "draft" && 
                <a className="btn btn-sm btn-danger" onClick={this.onDeleteClicked.bind(this)}>
                    <FontAwesomeIcon icon={faTimesCircle}></FontAwesomeIcon>
                </a>
            }
        </div>
    }

    renderDatesBlock() {
        return <div className="text-muted small">
            Ultima modifica: {formatDate(this.props.proposal.modified)}
        </div>
    }

    onClick() {
        // Redirect the user to the view page, or to the edit page if the proposal
        // is still in the draft state. 
        if (this.props.proposal.state == 'draft')
            window.location.href = Caps.root + 'proposals/edit/' + this.props.proposal.id;
        else
            window.location.href = Caps.root + 'proposals/view/' + this.props.proposal.id;
    }

    render() {
        const proposal = this.props.proposal;

        return <div className="my-2 col-xxl-3 col-xl-4 col-lg-6 col-12">
            <SmallCard className="clickable-card" title={proposal.curriculum.degree.name} onClick={this.onClick.bind(this)}>
                <div className="d-flex">
                    <div className="mb-2 mr-auto">
                        <ProposalStateBadge proposal={this.props.proposal} />
                    </div>
                    <div>
                        {this.renderButtons()}
                    </div>
                </div>
                <div><strong>{"Curriculum: " + proposal.curriculum.name}</strong></div>
                <div className="small text-muted">Regolamento dell'anno accademico {proposal.curriculum.degree.academic_year}/{proposal.curriculum.degree.academic_year+1}</div>
                {this.renderDatesBlock()}
            </SmallCard></div>;
    }

}

export default ProposalInfo;