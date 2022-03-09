import React from "react";

function FormBadge(props) {
    if (props.form.state == "draft") {
        return <span className="badge badge-sm badge-secondary">Bozza</span>;
    }
    if (props.form.state == "submitted") {
        return <span className="badge badge-sm badge-warning">Inviato</span>;
    }
    if (props.form.state == "approved") {
        return <span className="badge badge-sm badge-success">Approvato</span>;
    }
}

export default FormBadge;

