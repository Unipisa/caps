import React from "react";
import SmallCard from "./SmallCard";
import { formatDate } from '../modules/dates';

class FormInfo extends React.Component {

    renderBadge() {
        if (this.props.form.state == "draft") {
            return <span className="badge badge-sm badge-secondary">Bozza</span>;
        }
        if (this.props.form.state == "submitted") {
            return <span className="badge badge-sm badge-warning">Inviato</span>;
        }
        if (this.props.form.state == "approved") {
            return <span className="badge badge-sm badge-success">Approvato</span>;
        }
    }

    renderButtons() {
        return <div className="btn-group float-right">
            <a href={`${this.props.root}forms/view/${this.props.form.id}`}className="btn btn-sm btn-success">Visualizza</a>
            {this.props.form.state == "draft" && 
                <a href={`${this.props.root}forms/edit/${this.props.form.id}`} className="btn btn-sm btn-primary">Modifica</a>
            }
            {this.props.form.state == "draft" && 
                <a className="btn btn-sm btn-danger">Elimina</a>
            }
        </div>
    }

    renderDatesBlock() {
        return <div className="text-muted small">
            { this.props.form.date_submitted && <span>Inviato il {formatDate(this.props.form.date_submitted)}</span> }
        </div>
    }

    render() {
        return <div className="my-2 col-xxl-3 col-xl-4 col-lg-6 col-12">
            <SmallCard className="border-left-primary">
                <div className="mb-2">{this.renderBadge()}</div>
                <strong>{this.props.form.form_template.name}</strong>
                <div>{this.renderDatesBlock()}</div>
                <div className="mt-2">{this.renderButtons()}</div>
            </SmallCard></div>
    }

}

export default FormInfo;