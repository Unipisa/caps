'use strict';

const React = require('react');
const Groups = require('../models/groups')
const Exams = require('../models/exams');

class ExamInput extends React.Component {
    constructor(props) {
        super(props);

        var choices = null;

        switch (this.props.exam.type) {
            case "compulsory_group":
                this.loadGroupChoices();
                break;
            case "free_choice_exam":
                if (this.props.exam.group_id == null)
                    this.loadChoices();
                else
                    this.loadGroupChoices();
                break;
        }

        var credits = 0;
        var name = "";

        if (this.props.exam && this.props.exam.type == "free_exam" && this.props.exam.selection) {
            name = this.props.exam.selection.name;
            credits = this.props.exam.selection.credits;
        }

        this.state = {
            "selected_exam": this.props.exam.selection,
            "choices": choices,

            // These two fields are only used for Free exams, which are 
            // typed in manually by the user
            "credits": credits,
            "name": name
        };
    }

    async loadChoices() {
        const exams = await Exams.all();

        this.setState({
            choices: exams
        });
    }

    async loadGroupChoices() {
        const group = await Groups.get(this.props.exam.group_id);

        this.setState({
            group: group,
            choices: group.exams
        });
    }

    onFreeExamNameChanged(evt) {
        const text = evt.target.value;
        this.setState((s) => {
            if (this.props.onChange !== undefined) {
                this.props.onChange(this.props.exam, {
                    "name": text, "credits": s.credits
                });
            }

            return {
                name: text
            };
        });
    }

    onFreeExamCreditsChanged(evt) {
        var credits = parseInt(evt.target.value);

        if (isNaN(credits) || credits < 0)
            credits = 0;

        this.setState((s) => {
            if (this.props.onChange !== undefined) {
                this.props.onChange(this.props.exam, {
                    "name": s.name, "credits": credits
                });
            }

            return {
                credits: credits
            };
        });
    }

    renderFreeExam() {
        const note = this.props.freeChoiceMessage;

        return <li className="form-group row">
            <div className="col-9">
                <input className="form-control exam"
                    required="" type="text" placeholder="Un esame a scelta libera"
                    value={this.state.name}
                    onChange={this.onFreeExamNameChanged.bind(this)} />
                { note && <div className="col-9 mt-1 small text-muted" dangerouslySetInnerHTML={{__html: note}}></div> }
            </div>
            <div className="col-2">
                <input className="form-control credits"
                    type="number" min="1" required=""
                    value={this.state.credits}
                    onChange={this.onFreeExamCreditsChanged.bind(this)} />
            </div>
            <div className="col-1 my-auto" onClick={this.onDeleteClicked.bind(this)}>
                <i href='#' className='delete fas fw fa-trash'></i>
            </div>
        </li>;
    }

    onDeleteClicked() {
        if (this.props.deleteCallback !== undefined)
            this.props.deleteCallback();
    }

    async onExamSelected(evt) {
        const selected_exam = this.state.choices[evt.target.value];

        this.setState({
            selected_exam: selected_exam
        });

        // Trigger the onChange method from the parent, if specified
        if (this.props.onChange !== undefined) {
            this.props.onChange(this.props.exam, selected_exam);
        }
    }

    getCredits() {
        if (this.state.selected_exam === null) {
            return 0;
        }
        else {
            return this.state.selected_exam.credits;
        }
    }

    render() {
        // Free exams are a special case, we handle them separately
        if (this.props.exam.type == "free_exam") {
            return this.renderFreeExam();
        }

        var options = [];
        const removable = this.props.deleteCallback !== undefined;

        switch (this.props.exam.type) {
            case "compulsory_exam":
                options.push(
                    <option key={"exam-" + this.props.exam.exam_id} value={this.props.exam.exam.id}>
                        {this.props.exam.exam.code} &mdash; {this.props.exam.exam.name}
                    </option>
                )
                break;
            case "compulsory_group":
                options.push(
                    <option key="dummy" value="-1" disabled="1">Un esame a scelta nel gruppo {this.props.exam.group.name}</option>
                );
                break;
            case "free_choice_exam":
                options.push(
                    <option key="dummy" value="-1" disabled="1">Un esame a scelta libera</option>
                );
                break;
        }

        var selected_exam = -1;
        if (this.state.choices !== null) {
            this.state.choices.map((exam, i) =>
                options.push(<option key={"exam-choice-" + exam.id} value={i}>
                    {exam.code} &mdash; {exam.name}
                </option>)
            );

            // If the exam has been prescribed in the properties (for instance, if 
            // this proposal has been loaded as draft), we select the right element
            // in the dropdown list. 
            selected_exam = this.props.exam.selection ?
                this.state.choices.map((e) => e.id).indexOf(this.props.exam.selection.id)
                : -1;
        }

        const note = this.props.exam.exam ? this.props.exam.exam.notes : "";

        return <li className="form-group row">
            <div className="col-9">
                <select className="exam form-control"
                    value={selected_exam} onChange={this.onExamSelected.bind(this)}>
                    {options}
                </select>
                { note && <div className="col-9 mt-1 small text-muted" dangerouslySetInnerHTML={{__html: note}}></div> }
            </div>
            <div className={removable ? "col-2" : "col-3"}>
                <input className="credits form-control"
                    value={this.state.selected_exam ? this.state.selected_exam.credits : 0}
                    readOnly={this.props.exam !== undefined ? "1" : "0"} />
            </div>
            {removable && <div className="col-1 my-auto" onClick={this.onDeleteClicked.bind(this)}>
                <i className='delete fas fw fa-trash'></i>
            </div>}
        </li>;
    }

}

module.exports = ExamInput;
