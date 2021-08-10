'use strict';

const Degrees = require('../models/degrees');
const Curricula = require('../models/curricula');
const Proposals = require('../models/proposals');

const React = require('react');
const Card = require('./Card');
const LoadingMessage = require('./LoadingMessage');
const ProposalYear = require('./ProposalYear');

class Proposal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'degrees': null,
            'selected_degree': null,
            'curricula': null,
            'selected_curriculum': null,
            'selected_exams': null
        };

        this.loadDegrees();
    }

    async loadDegrees() {
        if (this.state.degrees === null) {
            this.setState({
                degrees: await Degrees.allActive()
            }, () => {
                if (this.props.id !== undefined) {
                    this.loadProposal(this.props.id);
                }
            });
        }
    }

    async loadProposal(id) {
        const proposal = await Proposals.get(id);
        const curriculum = await Curricula.get(proposal.curriculum.id);
        const degree = curriculum.degree;
        const curricula = await Curricula.forDegree(degree.id);

        // Read the exam selection in the proposal, and use them to populate 
        // the selected exams array in the correct way.

        this.setState((s) => {
            return {
                'curricula': curricula,
                'selected_curriculum': curriculum, 
                'selected_degree': degree,
                'selected_exams': []
            }
        });
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
            <select className="form-control" name="degree" id="degree_select" onChange={this.onDegreeSelected.bind(this)} 
                value={ this.state.selected_degree ? this.state.degrees.map((d) => d.id).indexOf(this.state.selected_degree.id) : -1 }>
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
            <select className="form-control" name="curriculum" id="curriculum_select" onChange={this.onCurriculaSelected.bind(this)}
                value={ this.state.selected_curriculum ? this.state.curricula.map((c) => c.id).indexOf(this.state.selected_curriculum.id) : -1}>
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
            this.setState({
                'selected_degree': this.state.degrees[degree_idx]
            }, () => this.loadCurricula());
        }
    }

    async onCurriculaSelected() {
        const idx = document.getElementById('curriculum_select').value;
        if (idx >= 0) {
            const curriculum_id = this.state.curricula[idx].id;
            const curriculum = await Curricula.get(curriculum_id);
            const years = curriculum.credits.length;
            this.setState({ 
                'selected_curriculum': curriculum,
                // We prepare selected exams as an array of arrays, each containing 
                // the exams selected for a given year
                'selected_exams': Array(years).fill().map(() => [])
            });
            
        }
    }

    renderProposal() {
        var rows = [];
        for (var i = 1; i <= this.state.selected_curriculum.credits.length; i++) {
            const year = i;
            rows.push(
                <ProposalYear key={"proposal-year-" + year} 
                  year={year} 
                  curriculum={this.state.selected_curriculum} 
                  onSelectedExamsChanged={(s) => this.onSelectedExamsChanged.bind(this)(year, s)} />
            );
        }
        
        return rows;
    }

    onSelectedExamsChanged(year, selected_exams) {
        // Wrapping this into a function is necessary to 
        // make sure there are no race conditions in the update, 
        // and the state is always read in an updated version.
        this.setState((s) => {
            return {
                selected_exams: [
                    ...s.selected_exams.slice(0, year - 1), 
                    selected_exams,
                    ...s.selected_exams.slice(year)
                ]
            };
        });
    }

    renderSubmitBlock() {
        var missing_selections = 0;

        // Count the number of missing selections for each of the curriculum's years. 
        this.state.selected_exams.map((se) => {
            missing_selections += se.filter(
                (e) => (e.type == "compulsory_exam" || e.type == "compulsory_group") && e.selection === null
            ).length;
        });

        // Compute the number of selected credits, and the number of required 
        // credits for this curriculum. 
        const sum = (e1, e2) => e1 + e2;
        const total_credits = this.state.selected_exams.map((se) => 
            se.map(e => e.selection === null ? 0 : e.selection.credits)
        ).reduce(
            (se1, se2) => se1 + se2.reduce(sum, 0), 0
        );
        const required_credits = this.state.selected_curriculum.credits.reduce(sum);

        // FIXME: We need to check for duplicate exams

        const submit_enabled = (missing_selections == 0) &&
            (total_credits >= required_credits);

        return  <div>
            
                <div id="proposalWarning">
                { missing_selections > 0 && 
                    <span>Non sono state effettuate {missing_selections} scelte obbligatorie. <br /></span> }
                { total_credits < required_credits && 
                    <span>Mancano {required_credits - total_credits} crediti per poter chiudere il piano. </span>}
                </div>
                <br />
            <div className="form-group btn-group">
                <button className="btn btn-success" disabled={ ! submit_enabled }>Sottometti piano di studio</button>
                <button className="btn btn-primary">Salva bozza</button>
            </div>
        </div>;
    }

    render() {
        return <div>
            <Card>{this.renderDegreeCurriculaSelection()}</Card>
            {this.state.selected_curriculum !== null && this.renderProposal()}
            {this.state.selected_curriculum !== null &&
              <Card>{this.renderSubmitBlock()}</Card>
            }
        </div>;
    }
}

module.exports = Proposal;