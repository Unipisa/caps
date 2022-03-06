'use strict';

import RestClient from "../modules/api";
import React from "react";

class Forms {
    async get(id) {
        return await RestClient.fetch('forms/' + id);
    }

    async delete(id) {
        return await RestClient.fetch('forms/' + id, 'DELETE');
    }

    renderBadge(form) {
        if (form.state == "draft") {
            return <span className="badge badge-sm badge-secondary">Bozza</span>;
        }
        if (form.state == "submitted") {
            return <span className="badge badge-sm badge-warning">Inviato</span>;
        }
        if (form.state == "approved") {
            return <span className="badge badge-sm badge-success">Approvato</span>;
        }
    }
}

export default new Forms();