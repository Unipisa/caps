'use strict';

const React = require('react');

class ProposalYearNavBar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <nav id={ "nav-year-" + this.props.year }>
            <div className="d-flex mb-4">
                <div className="flex-fill"></div>
                <a href="#" className="newMathematicsExam"><button type="button" className="btn-primary btn btn-sm mr-2">Aggiungi esame di Matematica</button></a>
                <a href="#" className="newFreeChoiceExam"><button type="button" className="btn-primary btn btn-sm">Aggiungi esame a scelta libera</button></a>
            </div>
        </nav>;
    }
}

module.exports = ProposalYearNavBar;