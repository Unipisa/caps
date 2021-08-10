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
            'selected_exams': null,
            'proposal': null
        };

        this.loadDegrees();
    }

    async loadDegrees() {
        if (this.state.degrees === null) {
            this.setState({
                degrees: (await Degrees.allActive()).sort((a,b) => {
                    if (a.academic_year > b.academic_year) return -1;
                    if (a.academic_year < b.academic_year) return 1;
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;}
                )}, () => {
                  if (this.props.id !== undefined)
                    this.loadProposal(this.props.id);
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
        // console.log(proposal);

        var selected_exams = Array(degree.years).fill();

        for (var year = 1; year <= degree.years; year++) {
          // Compute the list of selected exams for this year, if this is a 
          // proposal that has been already saved.
          var exams = [];
          var free_exams = [];
          exams = proposal.chosen_exams.filter((e) => e.chosen_year == year);
          free_exams = proposal.chosen_free_choice_exams.filter((e) => e.chosen_year == year);

          selected_exams[year-1] = this.createInitialState(curriculum, year, exams, free_exams, true);
        }

        this.setState((s) => {
            return {
                'curricula': curricula,
                'selected_curriculum': curriculum, 
                'selected_degree': degree,
                'selected_exams': selected_exams,
                'proposal': proposal
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
            const years = curriculum.degree.years;

            var selected_exams = Array(years).fill();
            
            for (var year = 1; year <= curriculum.degree.years; year++) {    
             selected_exams[year-1] = this.createInitialState(curriculum, year, [], [], true);
            }

            console.log(selected_exams);
    
            this.setState({ 
                'selected_curriculum': curriculum,
                'selected_exams': selected_exams
            });
            
        }
    }

    createInitialState(curriculum, year, exams, free_exams) {
      var selected_exams = [];

      curriculum.compulsory_exams
        .filter((e) => e.year == year)
        .map((e) => selected_exams.push({ ...e, "type": "compulsory_exam", "selection": e.exam }));

      curriculum.compulsory_groups
        .filter((e) => e.year == year)
        .map((e) => selected_exams.push({ ...e, "type": "compulsory_group", "selection": null }));

      curriculum.free_choice_exams
        .filter((e) => e.year == year)
        .map((e) => selected_exams.push({ ...e, "type": "free_choice_exam", "selection": null }));

      // We sort the exams based on their position index
      selected_exams.sort((a, b) => a.position < b.position);

      // If the user has prescribed some exams that have already been
      // chosen, try to match them to the constraints in the curriculum.
      selected_exams = this.matchExamsToCurriculum(selected_exams, exams, free_exams, this.state.proposal !== null);
      
      return selected_exams;
    }

    matchExamsToCurriculum(selected_exams, exams, free_exams, purge_removable) {
      var exams = [ ...exams ];
      var free_exams = [ ...free_exams ];

      while (exams.length > 0) {
        const e = exams.pop();
        var match = false; // This is set to true if we find a match

        if (e.compulsory_exam_id !== null) {
          const idx = selected_exams
            .map((e) => e.type == "compulsory_exam" ? e.id : -1)
            .indexOf(e.compulsory_exam_id);

          if (idx > -1) {
            selected_exams[idx].selection = e.exam;
            match = true;
          }
        }
        else if (e.compulsory_group_id != null) {
          const idx = selected_exams
          .map((e) => e.type == "compulsory_group" ? e.id : -1)
          .indexOf(e.compulsory_group_id);

          if (idx > -1) {
            selected_exams[idx].selection = e.exam;
            match = true;
          }
        }
        else {
          const idx = selected_exams
          .map((e) => e.type == "free_choice_exam" ? e.id : -1)
          .indexOf(e.free_choice_exam_id);

          if (idx > -1) {
            selected_exams[idx].selection = e.exam;
            match = true;
          }
        }

        if (! match) {
          selected_exams.push({
            type: "free_choice_exam",
            selection: e.exam,
            "id": "custom-" + this.props.year + "-" + this.id_counter++,
          })
        }
      }

      while (free_exams.length > 0) {
        const e = free_exams.pop();

       selected_exams.push({
          type: "free_exam",
          selection: {
            "name": e.name,
            "credits": e.credits
          },
          "id": "custom-" + this.props.year + "-" + this.id_counter++
        });
      }

      // At this point we can remove any removable exam that was not found in 
      // the saved entry, since this needs to have been deleted by the user. 
      // The only removable exams that are prescribed in the curricula are
      // free_choice_exams, so it's sufficient to check those. 
      if (purge_removable) {
        selected_exams = selected_exams
          .filter((e) => e.type != "free_choice_exam" || e.selection);
      }

      return selected_exams;
    }

    renderProposal() {
        var rows = [];
        for (var i = 1; i <= this.state.selected_degree.years; i++) {
            const year = i;

            const selected_exams = this.state.selected_exams[i-1];

            rows.push(
                <ProposalYear key={"proposal-year-" + year} 
                  year={year} 
                  curriculum={this.state.selected_curriculum} 
                  onSelectedExamsChanged={(s) => this.onSelectedExamsChanged.bind(this)(year, s)} 
                  selected_exams={selected_exams} />
            );
        }
        
        return rows;
    }

    onSelectedExamsChanged(year, selected_exams) {
      console.log(selected_exams);

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
        console.log(this.state.selected_exams);
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