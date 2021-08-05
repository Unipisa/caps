'use strict';

var React = require('react');

class ExamInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      "selected_exam": null,
      "exams": [
          'Exam1', 'Exam2'
      ]
    };
  }

  render() {
    var options = this.state.exams.map((e) => {
        return <option key={e}>{e}</option>;
    });

    return <select>
        {options}
    </select>;
  }

}

module.exports = ExamInput;
