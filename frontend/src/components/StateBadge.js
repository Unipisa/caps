import React from "react";

/**
 * Return an appropriate bootstrap color based on the proposal state. 
 * In particular, green if accepted, yellow for submission, red for 
 * rejected, gray otherwise. 
 */
export function proposalColor(proposal) {
    switch (proposal.state) {
        case 'approved':
            return "success";
        case 'submitted':
            return "warning";
        case 'rejected':
            return "danger";
        default:
            return 'secondary';
    }
}

export function formColor(form) {
    switch (form.state) {
        case 'approved':
            return "success";
        case 'submitted':
            if (form.form_template.require_approval) {
                return "warning";
            } else {
                return "success";
            }
        case 'rejected':
            return "danger";
        default:
            return 'secondary';
    }
}

const stateNames = {
    'draft': "Bozza",
    'submitted': "Inviato",
    'approved': "Approvato",
    'rejected': "Rifiutato"
};

export function ProposalStateBadge({ proposal }) {
    const color = proposalColor(proposal);
    return <span className={ `badge badge-sm badge-${color}` }>{ stateNames[proposal.state] }</span>
}

export function FormStateBadge({ form }) {
    const color = formColor(proposal);
    return <span className={ `badge badge-sm badge-${color}` }>{ stateNames[form.state] }</span>
}
