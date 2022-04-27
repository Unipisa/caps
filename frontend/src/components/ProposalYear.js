'use strict';

import React from 'react';
import ExamInput from './ExamInput';
import ProposalYearNavBar from './ProposalYearNavBar';


/**
 * Tracks one year of the proposal; it contains in the state an array of 
 * exams from the proposal, together with their current selection. They have 
 * the following form:
 * 
 * { 
 *   "exam": ... // in case of compulsory exams
 *   "group" ... // in case of compulsory groups
 *   "type": "XXX" // One of [ "compulsory_exam", "compulsory_group", "free_choice_exam", "free_exam" ]
 *   ... // other fields from the database
 * }
 */
class ProposalYear extends React.Component {

    constructor(props) {
        super(props);

        // We use these ids to uniquely identified the newly added free choice
        // exams, through the buttons in the navbar. 
        this.id_counter = 0;

        // Based on the data in the Curriculum, we generate the initial state
        // for this component, which holds all the exams that should be here.
        // this.createInitialState();
    }

    getTitle() {
        switch (this.props.year) {
            case 1:
                return "Primo anno";
            case 2:
                return "Secondo anno";
            case 3:
                return "Terzo anno";
        }

        return "Anno " + this.props.year;
    }

    getCreditsColor(credits, required_credits) {
        if (credits < required_credits) {
            return "text-danger";
        }
        else if (credits > required_credits) {
            return "text-warning";
        }

        return "";
    }

    handleExamDelete(exam) {
        var chosen_exams = this.props.chosen_exams;
        const idx = chosen_exams.indexOf(exam);

        if (idx > -1) {
            chosen_exams.splice(idx, 1);
            this.onSelectedExamsChanged(chosen_exams);
        }
    }

    handleExamSelected(exam, selected_exam) {
        const idx = this.props.chosen_exams.indexOf(exam);

        if (idx >= -1) {
            // This part is a bit tricky because we need to make a 
            // deep copy of the exam, and actually replace the array, 
            // not just the references, for React to trigger the 
            // correct re-rendering. 
            const exam = this.props.chosen_exams[idx];
            var exam_copy = { ...exam };
            exam_copy.selection = selected_exam;

            const chosen_exams = [
                ...this.props.chosen_exams.slice(0, idx),
                exam_copy,
                ...this.props.chosen_exams.slice(idx + 1),
            ];
            this.onSelectedExamsChanged(chosen_exams);
        }
    }

    onAddExamClicked() {
        const chosen_exams = [
            ...this.props.chosen_exams,
            {
                "type": "free_choice_exam",
                "id": "custom-" + this.props.year + "-" + this.id_counter,
                "group_id": this.props.degree.default_group_id,
                "group": this.props.degree.default_group,
                "selection": null,
                "year": this.props.year
            }
        ];

        this.id_counter++;
        this.onSelectedExamsChanged(chosen_exams);
    }

    onAddFreeExamClicked() {
        const chosen_exams = [
            ...this.props.chosen_exams,
            {
                "type": "free_exam",
                "id": "custom-" + this.props.year + "-" + this.id_counter,
                "selection": null,
                "year": this.props.year
            }
        ];

        this.id_counter++;
        this.onSelectedExamsChanged(chosen_exams);
    }

    onSelectedExamsChanged(chosen_exams) {
        if (this.props.onSelectedExamsChanged !== undefined) {
            this.props.onSelectedExamsChanged(chosen_exams);
        }
    }

    creditCount() {
        return this.props.chosen_exams.reduce(
            (a, b) => a + (b.selection != null ? b.selection.credits : 0),
            0
        );
    }

    render() {
        const title = this.getTitle();
        const required_credits = this.props.curriculum.credits[this.props.year - 1];

        const exam_inputs = this.props.chosen_exams.map((exam, i) => {
            const removable = exam.type == "free_choice_exam" || exam.type == "free_exam";
            const deleteCallback = () => this.handleExamDelete(exam);
            const onChangeCallback = (exam, se) => this.handleExamSelected(exam, se);

            // Compute the choices for this <ExamInput>
            let choices = [];   

            switch (exam.type) {
                case "compulsory_group":
                    choices = this.props.groups[exam.group_id].exams;
                    break;
                case "free_choice_exam":
                    if (this.props.degree.default_group_id) {
                        choices = this.props.groups[this.props.degree.default_group_id].exams;
                    }
                    else {
                        choices = this.props.exams;
                    }
                    break;
            }

            return <ExamInput exam={exam} key={"exam-input-" + exam.id}
                groups={this.props.groups}
                choices={choices}
                deleteCallback={removable ? deleteCallback : undefined}
                freeChoiceMessage={this.props.curriculum.degree.free_choice_message}
                onChange={onChangeCallback} />;
        });

        const credits = this.creditCount();
        const credits_color = this.getCreditsColor(credits, required_credits);

        return <div className="row my-2">
            <div className="col">
                <div className="card shadow">
                    <div className="card-header bg-primary">
                        <div className="d-flex justify-content-between align-content-center">
                            <h3 className="h5 text-white">{title}</h3>
                            <div className="h5 text-white">Crediti:
                                <span className={"credit-block " + credits_color}> {credits}</span>/{required_credits}
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        {exam_inputs}
                        <ProposalYearNavBar year={this.props.year} groups={this.props.groups}
                            degree={this.props.degree}
                            onAddExamClicked={this.onAddExamClicked.bind(this)}
                            onAddFreeExamClicked={this.onAddFreeExamClicked.bind(this)} />
                    </div>
                </div>
            </div>
        </div>
    }

}

export default ProposalYear;