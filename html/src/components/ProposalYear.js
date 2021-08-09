'use strict';

const React = require('react');
const ExamInput = require('./ExamInput');
const ProposalYearNavBar = require('./ProposalYearNavBar');

class ProposalYear extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
          selected_exams: []
        };

        // Based on the data in the Curriculum, we generate the initial state
        // for this component, which holds all the exams that should be here.
        this.createInitialState();
    }

    createInitialState() {
      var selected_exams = [];

      this.props.curriculum.compulsory_exams
        .filter((e) => e.year == this.props.year)
        .map((e) => selected_exams.push({ ...e, "type": "compulsory_exam", "selection": e.exam }));

      this.props.curriculum.compulsory_groups
        .filter((e) => e.year == this.props.year)
        .map((e) => selected_exams.push({ ...e, "type": "compulsory_group", "selection": null }));

      this.props.curriculum.free_choice_exams
        .filter((e) => e.year == this.props.year)
        .map((e) => selected_exams.push({ ...e, "type": "free_choice_exam", "selection": null }));

      // We sort the exams based on their position index
      selected_exams.sort((a, b) => a.position < b.position);

      this.state["selected_exams"] = selected_exams;
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
      var selected_exams = this.state.selected_exams;
      const idx = selected_exams.indexOf(exam);

      if (idx > -1) {
        selected_exams.splice(idx, 1);

        this.setState({ 
          selected_exams: selected_exams
        });
      }
    }

    handleExamSelected(exam, selected_exam) {
      const idx = this.state.selected_exams.indexOf(exam);

      if (idx >= -1) {
        // This part is a bit tricky because we need to make a 
        // deep copy of the exam, and actually replace the array, 
        // not just the references, for React to trigger the 
        // correct re-rendering. 
        const exam = this.state.selected_exams[idx];
        var exam_copy = { ...exam };
        exam_copy.selection = selected_exam;

        this.setState({
          selected_exams: [ 
            ...this.state.selected_exams.slice(0, idx), 
            exam_copy, 
            ...this.state.selected_exams.slice(idx+1), 
          ]
        });
      }
    }

    creditCount() {
      return this.state.selected_exams.reduce(
        (a, b) => a + (b.selection != null ? b.selection.credits : 0),
        0
      );
    }

    render() {
        const title = this.getTitle();
        const required_credits = this.props.curriculum.credits[this.props.year - 1];

        const exam_inputs = this.state.selected_exams.map((exam, i) => {
          const deleteCallback = () => this.handleExamDelete(exam);
          const onChangeCallback = (exam, se) => this.handleExamSelected(exam, se);
          return <ExamInput exam={exam} key={"exam-input-" + i} 
                            deleteCallback={exam.type == "free_choice_exam" ? deleteCallback : undefined}
                            onChange={onChangeCallback} />;
        });

        // We save this to be able to recompute the number of credits afterwards
        this.exam_inputs = exam_inputs;

        const credits = this.creditCount();
        const credits_color = this.getCreditsColor(credits, required_credits);

        return <div className="row my-2">
            <div className="col">
                <div className="card shadow">
                    <div className="card-header bg-primary">
                        <div className="d-flex justify-content-between align-content-center">
                            <h3 className="h5 text-white">{title}</h3>
                            <div className="h5 text-white">Crediti:  
                                    <span className={ "credit-block " + credits_color } 
                                      id="credit-block-1"> {credits}</span>/{required_credits}
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <ProposalYearNavBar year={this.props.year} />
                        {exam_inputs}
                    </div>
                </div>
            </div>
        </div>
    }

}

module.exports = ProposalYear;