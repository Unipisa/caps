'use strict';

const React = require('react');
const Groups = require('../models/groups')

class ExamInput extends React.Component {
  constructor(props) {
    super(props);

    var choices = null;

    if (this.props.group !== undefined) {
      this.loadChoices();
    }

    this.state = {
      "selected_exam": this.props.exam ? this.props.exam.exam : null,
      "choices": choices
    };
  }

  async loadChoices() {
    const group = await Groups.get(this.props.group.id);

    this.setState({
      group: group,
      choices: group.exams
    });
  }

  render() {
    var options = [];
    const compulsory = this.props.exam !== undefined;

    if (compulsory) {
      const exam = this.props.exam.exam;
      options.push(
        <option key={"exam-" + this.props.exam.exam_id} value={exam.id}>
          {exam.name}
        </option>
      )
    }

    if (this.props.group !== undefined) {
      options.push(
        <option key="dummy" value="-1" disabled="1">Un esame a scelta nel gruppo {this.props.group.name}</option>
      );
    }

    if (this.state.choices !== null) {
      this.state.choices.map((exam, i) => 
        options.push(<option key={"exam-choice-" + exam.id} value={exam.id}>
          {exam.name}
        </option>)
      );
    }

    return <li className="form-group row">
        <div className="col-9">
            <select name="data[ChosenExam][][exam_id]" className="exam form-control" defaultValue="-1">
              {options}
            </select>
        </div>
        <div className="col-3">
          <input className="credits form-control" name="data[ChosenExam][][credits]" 
                 value={ this.state.selected_exam ? this.state.selected_exam.credits : 0 } 
                 readOnly={compulsory ? "1" : "0" } />
        </div>
        <input type="hidden" name="data[ChosenExam][][compulsory_exam_id]" value="578" />
        <input type="hidden" name="data[ChosenExam][][chosen_year]" value={this.props.year} />
      </li>;
  }

}

module.exports = ExamInput;
