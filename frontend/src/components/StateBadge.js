import React from "react";

function StateBadge({state}) {
    if (state == "draft") {
        return <span className="badge badge-sm badge-secondary">Bozza</span>;
    }
    if (state == "submitted") {
        return <span className="badge badge-sm badge-warning">Inviato</span>;
    }
    if (state == "approved") {
        return <span className="badge badge-sm badge-success">Approvato</span>;
    }
    if (state == "rejected") {
        return <span className="badge badge-sm badge-danger">Rifiutato</span>;
    }
    throw new RangeError(`invalid state '${state}'`);
}

export default StateBadge;

