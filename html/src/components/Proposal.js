'use strict';

const Degrees = require('../models/degrees');
const Curricula = require('../models/curricula');
const Proposals = require('../models/proposals');

const submitForm = require('../modules/form-submission');

const React = require('react');
const Card = require('./Card');
const LoadingMessage = require('./LoadingMessage');
const ProposalYear = require('./ProposalYear');
const CapsAppController = require('../controllers/app-controller');

class Proposal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'degrees': null,
            'selected_degree': null,
            'curricula': null,
            'selected_curriculum': null,
            'chosen_exams': [],
            'proposal': null
        };

        this.id_counter = 0;

        // TODO: penso sarebbe meglio che fosse il controller a 
        // prendere la querystring e passarla come parametro 
        // alla componente React. 
        //
        // leggiamo i parametri degree_id e curriculum_id dalla querystring, se presenti
        const urlParams = new URLSearchParams(window.location.search);
        this.degree_id = parseInt(urlParams.get('degree_id'));
        this.curriculum_id = parseInt(urlParams.get('curriculum_id'));
        
        this.loadDegrees();
    }

    async loadDegrees() {
        if (this.state.degrees === null) {
            let degrees = (await Degrees.allActive()).sort((a, b) => {
                if (a.academic_year > b.academic_year) return -1;
                if (a.academic_year < b.academic_year) return 1;
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
                });
            let selected_degree = null;
            if (this.degree_id) {
                selected_degree = degrees.filter(degree => (degree.id === this.degree_id))[0];
                if (!selected_degree) {
                    // il degree passato dalla querystring potrebbe non essere attivo
                    // in tal caso lo aggiungiamo comunque alla lista
                    selected_degree = await  Degrees.get(this.degree_id);
                    degrees.push(selected_degree);
                }
            }

            this.setState({degrees, selected_degree}, () => {
                if (selected_degree) this.loadCurricula();
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

        const chosen_exams = this.createInitialState(curriculum, proposal.chosen_exams, proposal.chosen_free_choice_exams, true);

        this.setState((s) => {
            return {
                'curricula': curricula,
                'selected_curriculum': curriculum,
                'selected_degree': degree,
                'chosen_exams': chosen_exams,
                'proposal': proposal,
                'saving': false // this is set to true when save is clicked, to avoid double requests
            }
        });
    }

    async loadCurricula() {
        const degree = this.state.selected_degree;
        const curricula = await Curricula.forDegree(degree.id);
        var chosen_exams = [];
        let selected_curriculum = null;
        if (this.curriculum_id) {
            // seleziona il curriculum indicato nella querystring
            selected_curriculum = await Curricula.get(this.curriculum_id);
            if (selected_curriculum !== null) {
                chosen_exams = this.createInitialState(selected_curriculum, [], [], true);
            }
        }
        this.setState({curricula, selected_curriculum, chosen_exams});
    }

    renderDegreeSelection() {
        const options = this.state.degrees.map((degree, idx) => {
            return <option key={"degree-" + degree.id} value={idx}>
                {degree.name} &mdash; anno di immatricolazione {degree.academic_year}/{degree.academic_year + 1}
            </option>;
        });

        return <div className="form-group" key="degree-selection">
            <select className="form-control" onChange={this.onDegreeSelected.bind(this)}
                value={this.state.selected_degree ? this.state.degrees.map((d) => d.id).indexOf(this.state.selected_degree.id) : -1}>
                <option key="degree-dummy" value="-1">
                    Selezionare il corso di Laurea
                </option>
                {options}
            </select>
        </div>;
    }

    async onDegreeSelected(evt) {
        const degree_idx = evt.target.value;

        if (this.state.selected_degree !== null) {
            const res = confirm('Cambiare corso di Laurea comporta la perdita di tutte le modifiche non salvate. Procedere ugualmente?');
            if (! res) {
                evt.preventDefault();
                return;
            }
        }

        if (degree_idx >= 0) {
            this.setState({
                'selected_degree': this.state.degrees[degree_idx],
                'selected_curriculum': null,
                'chosen_exams': []
            }, () => this.loadCurricula());
        }
    }

    async onCurriculaSelected(evt) {
        const idx = evt.target.value;

        if (this.state.selected_curriculum !== null) {
            const res = confirm('Cambiare curriculum comporta la perdita di tutte le modifiche non salvate. Procedere ugualmente?');
            if (! res) {
                evt.preventDefault();
                return;
            }
        }

        if (idx >= 0) {
            // A partial version of the curriculum is loaded first, as listed
            // in this.state.curricula. This displays the <LoadingMessage> for
            // the user, while we make the necessary AJAX calls to set up the
            // proposal.
            this.setState({
                'selected_curriculum': this.state.curricula[idx],
                'chosen_exams': []
            }, async () => {
                const curriculum_id = this.state.curricula[idx].id;
                const curriculum = await Curricula.get(curriculum_id);
                var chosen_exams = this.createInitialState(curriculum, [], [], true);

                this.setState({
                    'selected_curriculum': curriculum,
                    'chosen_exams': chosen_exams
                });
            });
        }
    }

    createInitialState(curriculum, exams, free_exams) {
        var chosen_exams = [];

        curriculum.compulsory_exams
            .map((e) => chosen_exams.push({ ...e, "type": "compulsory_exam", "selection": e.exam }));

        curriculum.compulsory_groups
            .map((e) => chosen_exams.push({ ...e, "type": "compulsory_group", "selection": null }));

        curriculum.free_choice_exams
            .map((e) => chosen_exams.push({ ...e, "type": "free_choice_exam", "selection": null }));

        // We sort the exams based on their position index
        chosen_exams.sort((a, b) => a.position < b.position);

        // If the user has prescribed some exams that have already been
        // chosen, try to match them to the constraints in the curriculum.
        chosen_exams = this.matchExamsToCurriculum(chosen_exams, exams, free_exams);

        return chosen_exams;
    }

    matchExamsToCurriculum(chosen_exams, exams, free_exams) {
        var exams = [...exams];
        var free_exams = [...free_exams];

        while (exams.length > 0) {
            const e = exams.pop();
            var match = false; // This is set to true if we find a match

            if (e.compulsory_exam_id !== null) {
                const idx = chosen_exams
                    .map((e) => e.type == "compulsory_exam" ? e.id : -1)
                    .indexOf(e.compulsory_exam_id);

                if (idx > -1) {
                    chosen_exams[idx].selection = e.exam;
                    match = true;
                }
            }
            else if (e.compulsory_group_id != null) {
                const idx = chosen_exams
                    .map((e) => e.type == "compulsory_group" ? e.id : -1)
                    .indexOf(e.compulsory_group_id);

                if (idx > -1) {
                    chosen_exams[idx].selection = e.exam;
                    match = true;
                }
            }
            else {
                const idx = chosen_exams
                    .map((e) => e.type == "free_choice_exam" ? e.id : -1)
                    .indexOf(e.free_choice_exam_id);

                if (idx > -1) {
                    chosen_exams[idx].selection = e.exam;
                    match = true;
                }
            }

            if (!match) {
                chosen_exams.push({
                    type: "free_choice_exam",
                    selection: e.exam,
                    year: e.chosen_year,
                    "id": "custom-" + this.id_counter++,
                })
            }
        }

        while (free_exams.length > 0) {
            const e = free_exams.pop();

            chosen_exams.push({
                type: "free_exam",
                selection: {
                    "name": e.name,
                    "credits": e.credits,
                    "year": e.chosen_year
                },
                "id": "custom-" + this.id_counter++,
                "year": e.chosen_year
            });
        }

        return chosen_exams;
    }

    onSelectedExamsChanged(year, chosen_exams) {
        // Wrapping this into a function is necessary to 
        // make sure there are no race conditions in the update, 
        // and the state is always read in an updated version.
        this.setState((s) => {
            return {
                chosen_exams: [
                    ...s.chosen_exams.filter((e) => e.year < year),
                    ...chosen_exams,
                    ...s.chosen_exams.filter((e) => e.year > year)
                ]
            };
        });
    }

    onSaveDraft() {
        this.setState({
            'saving': true, 
        }, () => this.save(true));
    }

    onSubmit() {
        const res = confirm(
            'Una volta sottomesso il piano, non sarà più possibile modificarlo, ' +
            'né sottometterne di nuovi fino ad avvenuta approvazione.\n\n' +
            'Sottomettere definitivamente il piano?');

        if (! res) {
            return;
        }

        this.setState({ 
            saving: true
        }, () => this.save(false));
    }

    async save(draft = false) {
        var chosen_exams = [];
        var chosen_free_choice_exams = [];

        this.state.chosen_exams.map((e) => {
            const year = e.year;
            if (e.type == "free_exam") {
                chosen_free_choice_exams.push({
                    name: e.selection.name,
                    credits: e.selection.credits,
                    chosen_year: year
                });
            }
            else {
                if (e.selection) {
                    chosen_exams.push({
                        exam_id: e.selection.id,
                        chosen_year: year,
                        credits: e.selection.credits,
                        compulsory_exam_id: e.type == "compulsory_exam" ? e.id : null,
                        compulsory_group_id: e.type == "compulsory_group" ? e.id : null,
                        free_choice_exam_id: e.type == "free_choice_exam" ? e.id : null
                    });
                }
            }
        });

        var payload = new URLSearchParams();

        for (var i = 0; i < chosen_exams.length; i++) {
            payload.append(`data[ChosenExam][${i}][exam_id]`, chosen_exams[i].exam_id);
            payload.append(`data[ChosenExam][${i}][chosen_year]`, chosen_exams[i].chosen_year);
            payload.append(`data[ChosenExam][${i}][credits]`, chosen_exams[i].credits);
            payload.append(`data[ChosenExam][${i}][compulsory_exam_id]`, chosen_exams[i].compulsory_exam_id);
            payload.append(`data[ChosenExam][${i}][compulsory_group_id]`, chosen_exams[i].compulsory_group_id);
            payload.append(`data[ChosenExam][${i}][free_choice_exam_id]`, chosen_exams[i].free_choice_exam_id);
        }

        for (var i = 0; i < chosen_free_choice_exams.length; i++) {
            payload.append(`data[ChosenFreeChoiceExam][${i}][name]`, chosen_free_choice_exams[i].name);
            payload.append(`data[ChosenFreeChoiceExam][${i}][credits]`, chosen_free_choice_exams[i].credits);
            payload.append(`data[ChosenFreeChoiceExam][${i}][chosen_year]`, chosen_free_choice_exams[i].chosen_year);
        }

        payload.append('curriculum_id', this.state.selected_curriculum.id);
        payload.append('academic_year', this.state.selected_degree.academic_year);

        if (draft)
            payload.append('action-save', "true");
        else
            payload.append('action-close', "true");

        payload.append('_csrfToken', this.props.csrfToken);

        submitForm(window.location.href, 'post', payload);
    }

    renderCurriculaSelection() {
        const options = this.state.curricula.map((c, idx) => {
            return <option key={"curriculum-" + c.id} value={idx}>{c.name}</option>
        });
        return <div className="form-group" key="curricula-selection">
            <select className="form-control" onChange={this.onCurriculaSelected.bind(this)}
                value={this.state.selected_curriculum ? this.state.curricula.map((c) => c.id).indexOf(this.state.selected_curriculum.id) : -1}>
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
            blocks.push(<LoadingMessage key="loading-degrees">Caricamento cordi di laurea...</LoadingMessage>);
        }
        else {
            blocks.push(this.renderDegreeSelection());
            if (this.state.selected_degree) {
                if (this.state.curricula === null) {
                    blocks.push(<LoadingMessage key="loading-curricula">Caricamento curricula...</LoadingMessage>)
                }
                else {
                    blocks.push(this.renderCurriculaSelection());
                }
            }
        }

        return blocks;
    }

    renderProposal() {
        var rows = [];

        if (this.state.chosen_exams.length == 0) {
            return <Card>
                <LoadingMessage>Caricamento del piano in corso...</LoadingMessage>
            </Card>;
        }

        for (var i = 1; i <= this.state.selected_degree.years; i++) {
            const year = i;
            const chosen_exams = this.state.chosen_exams.filter((e) => e.year == year);

            rows.push(
                <ProposalYear key={"proposal-year-" + year}
                    year={year}
                    curriculum={this.state.selected_curriculum}
                    onSelectedExamsChanged={(s) => this.onSelectedExamsChanged.bind(this)(year, s)}
                    chosen_exams={chosen_exams} />
            );
        }

        return rows;
    }

    renderSubmitBlock() {
        if (this.state.saving) {
            return <LoadingMessage>
                Salvataggio del piano in corso ...
            </LoadingMessage>;
        }

        // Count the number of missing selections for each of the curriculum's years. 
        const missing_selections = this.state.chosen_exams.filter(
            (e) => (e.type == "compulsory_exam" || e.type == "compulsory_group") && e.selection === null
        ).length;

        // Compute the number of selected credits, and the number of required 
        // credits for this curriculum. 
        const sum = (e1, e2) => e1 + e2;
        const total_credits = this.state.chosen_exams.map(
            (e) => e.selection ? e.selection.credits : 0
        ).reduce((se1, se2) => se1 + se2, 0);
        const required_credits = this.state.selected_curriculum.credits.reduce(sum);

        // Check for duplicate exams
        var found_exams = {};
        var duplicate_exams = [];
        this.state.chosen_exams.map((e) => {
            if (e.selection && e.selection.id) {
                if (found_exams.hasOwnProperty(e.selection.id)) {
                    duplicate_exams.push(e.selection.name);
                }
                found_exams[e.selection.id] = true;
            }
        });
        const duplicate_list = duplicate_exams.reduce((a, e) => {
            return a + (a == "" ? "" : ", ") + e;
        }, "");

        const submit_enabled = (missing_selections == 0) &&
            (total_credits >= required_credits) &&
            (duplicate_exams.length == 0);

        return <div>
            { submit_enabled || <div>Il piano non può essere sottomesso per i seguenti motivi:</div>}
            <ul id="proposalWarning">
                {missing_selections > 0 &&
                    <li>Non sono state effettuate <strong>{missing_selections} { missing_selections == 1 ? "scelta obbligatoria" : "scelte obbligatorie" }</strong>.
                </li>}
                {total_credits < required_credits &&
                    <li>Sono stati selezionati esami per <strong>{total_credits}</strong> crediti su <strong>{required_credits}</strong>.</li>}
                {duplicate_exams.length > 0 &&
                    <li>Sono presenti i seguenti <strong>esami duplicati</strong>: {duplicate_list}.</li>}
            </ul>
            <div className="form-group btn-group">
                <button className="btn btn-success" disabled={!submit_enabled} onClick={this.onSubmit.bind(this)}>Sottometti piano di studio</button>
                <button className="btn btn-primary" onClick={this.onSaveDraft.bind(this)}>Salva bozza</button>
            </div>
        </div>;
    }

    render() {
        // If we are opening a proposal, but it has not been loaded yet, we display 
        // a LoadingMessage instead of the usual "Loading degrees" indicator. 
        if (this.props.id !== undefined && this.state.chosen_exams === null) {
            return <Card>
                <LoadingMessage>Caricamento del piano in corso ...</LoadingMessage>
            </Card>;
        }

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