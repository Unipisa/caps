'use strict';

const React = require('react');
const Card = require('./Card');
const LoadingMessage = require('./LoadingMessage');
const Degrees = require('../models/degrees');
const Curricula = require('../models/curricula');

class Proposal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'degrees': null,
            'selected_degree': null,
            'curricula': null,
            'selected_curriculum': null,
            'proposal': null
        };

        this.loadDegrees();
    }

    async loadDegrees() {
        if (this.state.degrees === null) {
            this.setState({
                degrees: await Degrees.all()
            });
        }
    }

    async loadCurricula() {
        const degree = this.state.selected_degree;
        this.setState({
            curricula: await Curricula.forDegree(degree.id)
        });
    }

    renderDegreeSelection() {
        const options = this.state.degrees.map((degree, idx) => {
            return <option key={"degree-" + degree.id} value={idx}>
                {degree.name} &mdash; anno di immatricolazione {degree.academic_year}/{degree.academic_year+1}
            </option>;
        });

        return <div className="form-group" key="degree-selection">
            <select className="form-control" name="degree" id="degree_select" onChange={this.onDegreeSelected.bind(this)}>
                <option key="degree-dummy" value="-1">
                    Selezionare il corso di Laurea
                </option>
                {options}
            </select>
        </div>;
    }

    renderCurriculaSelection() {
        const options = this.state.curricula.map((c, idx) => {
            return <option key={"curriculum-" + c.id} value={idx}>{c.name}</option>
        });
        return <div className="form-group" key="curricula-selection">
            <select className="form-control" name="curriculum" id="curriculum_select" onChange={this.onCurriculaSelected.bind(this)}>
                <option key="curriculum-dummy" value="-1">
                    Selezionare il Curriculum
                </option>
                {options}
            </select>
        </div>;
    }

    renderDegreeCurriculaSelection() {
        var blocks = [];

        if (this.state.degrees === null) {
            blocks.push(<LoadingMessage key="loading-degrees">Loading degrees...</LoadingMessage>);
        }
        else {
            blocks.push(this.renderDegreeSelection());
            if (this.state.selected_degree) {
                if (this.state.curricula === null) {
                    blocks.push(<LoadingMessage key="loading-curricula">Loading curricula...</LoadingMessage>)
                }
                else {
                    blocks.push(this.renderCurriculaSelection());
                }
            }
        }

        return blocks;
    }

    async onDegreeSelected() {
        const degree_idx = document.getElementById('degree_select').value;
        if (degree_idx >= 0) {
            await this.setState({
                'selected_degree': this.state.degrees[degree_idx]
            })
            this.loadCurricula();
        }
    }

    async onCurriculaSelected() {
        const idx = document.getElementById('curriculum_select').value;
        console.log(idx);
        if (idx >= 0) {
            const curriculum_id = this.state.curricula[idx].id;
            const curriculum = await Curricula.get(curriculum_id);
            await this.setState({ 
                'selected_curriculum': curriculum
            });
            console.log(this.state.selected_curriculum);
        }
    }

    renderProposal() {
        return "Proposal here";
    }

    render() {
        return <div>
            <Card>{this.renderDegreeCurriculaSelection()}</Card>
            {this.state.proposal !== null && <Card>{this.renderProposal()}</Card>}
        </div>;
    }
}

module.exports = Proposal;