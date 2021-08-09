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
        // FIXME: We are currently not handling the case where this is a free choice 
        // exam in a group, and instead we are always loading all the exams. 
        this.loadChoices();
        break;
    }

    this.state = {
      "selected_exam": this.props.exam.selection,
      "choices": choices
    };
  }

  async loadChoices() {
    const exams = await Exams.all();

    this.setState({
      choices: exams
    });
  }

  async loadGroupChoices() {
    const group = await Groups.get(this.props.exam.group.id);

    this.setState({
      group: group,
      choices: group.exams
    });
  }

  renderFreeChoiceExam() {
    // return <li className="form-group row">
    //   <div className="col-9">
    //     <input className="form-control exam" name="data[ChosenFreeChoiceExam][][name]" required="" type="text" placeholder="Un esame a scelta libera" value="" />
    //   </div>
    //     <input className="form-control" type="hidden" name="data[ChosenFreeChoiceExam][][chosen_year]" value="1" />
    //   <div className="col-2">
    //     <input className="form-control credits" name="data[ChosenFreeChoiceExam][][credits]" type="number" min="1" required="" value="" />
    //   </div>
    //   <div className="col-1 my-auto">
    //     <a href='#' className='delete fas fw fa-trash'></a>
    //   </div>
    // </li>;
  }

  onDeleteClicked() {
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
    var options = [];
    var hidden_fields = [];

    const removable = this.props.deleteCallback !== undefined;

    switch (this.props.exam.type) {
      case "compulsory_exam":
        options.push(
          <option key={"exam-" + this.props.exam.exam_id} value={this.props.exam.exam.id}>
            {this.props.exam.exam.name}
          </option>
        )
        hidden_fields.push(
          <input key="compulsory-exam-id" type="hidden" name="data[ChosenExam][][compulsory_exam_id]" value={this.props.exam.id} />
        );
        break;
      case "compulsory_group":
        options.push(
          <option key="dummy" value="-1" disabled="1">Un esame a scelta nel gruppo {this.props.exam.group.name}</option>
        );
        hidden_fields.push(
          <input key="compulsory-group-id" type="hidden" name="data[ChosenExam][][compulsory_group_id]" value={ this.props.exam.group.id }></input>
        )
        break;
      case "free_choice_exam":
        options.push(
          <option key="dummy" value="-1" disabled="1">Un esame a scelta libera</option>
        );
        break;
    }

    if (this.state.choices !== null) {
      this.state.choices.map((exam, i) => 
        options.push(<option key={"exam-choice-" + exam.id} value={i}>
          {exam.name}
        </option>)
      );
    }

    return <li className="form-group row">
        <div className="col-9">
            <select name="data[ChosenExam][][exam_id]" className="exam form-control" defaultValue="-1" onChange={this.onExamSelected.bind(this)}>
              {options}
            </select>
        </div>
        <div className={ removable ? "col-2" : "col-3" }>
          <input className="credits form-control" name="data[ChosenExam][][credits]" 
                 value={ this.state.selected_exam ? this.state.selected_exam.credits : 0 } 
                 readOnly={this.props.exam !== undefined ? "1" : "0" } />
        </div>
        { removable && <div className="col-1 my-auto" onClick={this.onDeleteClicked.bind(this)}>
          <i className='delete fas fw fa-trash'></i>
        </div>}
        <input type="hidden" name="data[ChosenExam][][chosen_year]" value={this.props.year} />
        { hidden_fields }
      </li>;
  }

}

module.exports = ExamInput;
