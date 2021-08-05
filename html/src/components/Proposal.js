'use strict';

const React = require('react');
const Card = require('./Card');
const ExamInput = require('./ExamInput');
const Degrees = require('../models/degrees');

class Proposal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'degrees': null,
            'selected_degree': null
        };
    }

    async loadDegrees() {
        if (this.state.degrees === null) {
            this.setState({
                degrees: await Degrees.all()
            });
        }
    }

    renderDegreeSelection() {
        var body = "";

        if (this.state.degrees === null) {
            body = "Loading degrees ...";
        }
        else {
            const options = this.state.degrees.map((degree, idx) => {
                return <option key={"degree-" + degree.id} value={idx}>
                    {degree.name} - {degree.academic_year}/{degree.academic_year+1}
                </option>;
            });

            body = <div className="form-group">
                <select className="form-control" name="degree" id="degree_select" onChange={this.onDegreeSelected.bind(this)}>
                    <option key="degree-dummy" value="-1">
                        Selezionare il corso di Laurea
                    </option>
                    {options}
                </select>
            </div>;
        }

        return <Card key="degree-selection">{body}</Card>;
    }

    onDegreeSelected() {
        const degree_idx = document.getElementById('degree_select').value;
        if (degree_idx >= 0) {
            this.setState({
                'selected_degree': this.state.degrees[degree_idx]
            })
        }
    }

    renderProposal() {
        return <div key="proposal">"Proposal"</div>;
    }

    render() {
        this.loadDegrees();

        var pieces = [
            this.renderDegreeSelection()
        ];

        if (this.state.selected_degree !== null) {
            pieces.push(this.renderProposal());
        }

        return pieces;
    }
}

module.exports = Proposal;