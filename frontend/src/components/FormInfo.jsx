import React from "react";
import SmallCard from "./SmallCard";
import { formatDate } from '../modules/dates';
import { FormStateBadge } from './StateBadge';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faEdit } from '@fortawesome/free-solid-svg-icons'

class FormInfo extends React.Component {

    async onDeleteClicked(evt) {
        if (this.props.onDeleteClicked !== undefined) {
            this.props.onDeleteClicked(this);
        }
        evt.stopPropagation();
    }

    renderButtons() {
        return <div className="btn-group">
            {this.props.form.state == "draft" && 
                <a onClick={(e) => e.stopPropagation()} href={`${this.props.root}forms/edit/${this.props.form.id}`} className="btn btn-sm btn-primary">
                    <FontAwesomeIcon icon={faEdit} />
                </a>
            }
            {this.props.form.state == "draft" && 
                <a className="btn btn-sm btn-danger" onClick={this.onDeleteClicked.bind(this)}>
                    <FontAwesomeIcon icon={faTimesCircle} />
                </a>
            }
        </div>
    }

    renderDatesBlock() {
        return <div className="text-muted small">
            { this.props.form.date_submitted && <span>Inviato il {formatDate(this.props.form.date_submitted)}</span> }
        </div>
    }

    onClick() {
        window.location.href = `${this.props.root}forms/view/${this.props.form.id}`
    }

    render() {
        return <div className="my-2 col-xxl-3 col-xl-4 col-lg-6 col-12">
            <SmallCard onClick={this.onClick.bind(this)} className="border-left-primary clickable-card">
                <div className="d-flex">
                    <div className="mb-2 mr-auto">
                        <FormStateBadge form={ this.props.form } />
                    </div>
                    {this.renderButtons()}
                </div>
                <strong>{this.props.form.form_template.name}</strong>
                <div>{this.renderDatesBlock()}</div>
            </SmallCard></div>
    }

}

export default FormInfo;