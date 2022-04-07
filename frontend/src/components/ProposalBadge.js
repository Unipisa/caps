import React from "react";

function ProposalBadge(props) {
    if (props.proposal.state == "draft") {
        return <span className="badge badge-sm badge-secondary">Bozza</span>;
    }
    if (props.proposal.state == "submitted") {
        return <span className="badge badge-sm badge-warning">Inviato</span>;
    }
    if (props.proposal.state == "approved") {
        return <span className="badge badge-sm badge-success">Approvato</span>;
    }
    if (props.proposal.state == "rejected") {
        return <span className="badge badge-sm badge-danger">Rifiutato</span>;
    }

    return <></>;
}

export default ProposalBadge;

