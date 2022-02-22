'use strict';

import React from "react";

class ProposalYearNavBar extends React.Component {

    constructor(props) {
        super(props);
    }

    onAddExamClicked() {
        if (this.props.onAddExamClicked !== undefined) {
            this.props.onAddExamClicked();
        }
    }

    onAddFreeExamClicked() {
        if (this.props.onAddFreeExamClicked !== undefined) {
            this.props.onAddFreeExamClicked();
        }
    }

    render() {
        const cds = Caps.params.settings.cds;

        return <nav>
            <div className="d-flex mt-4">
                <div className="flex-fill"></div>
                <button type="button" className="btn-primary btn btn-sm mr-2" onClick={this.onAddExamClicked.bind(this)}>
                    Aggiungi esame di {this.props.degree.default_group ? this.props.degree.default_group.name : cds}
                </button>
                <button type="button" className="btn-primary btn btn-sm" onClick={this.onAddFreeExamClicked.bind(this)}>
                    Aggiungi esame a scelta libera
                </button>
            </div>
        </nav>;
    }
}

export default ProposalYearNavBar;