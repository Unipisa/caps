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
        .map((e) => selected_exams.push(e));

      this.props.curriculum.compulsory_groups
        .filter((e) => e.year == this.props.year)
        .map((e) => selected_exams.push(e));

      this.props.curriculum.free_choice_exams
        .filter((e) => e.year == this.props.year)
        .map((e) => selected_exams.push(e));

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

    render() {
        const title = this.getTitle();
        const required_credits = this.props.curriculum.credits[this.props.year - 1];
        const credits = 0;
        const credits_color = this.getCreditsColor(credits, required_credits);

        const exam_inputs = this.state.selected_exams.map((exam, i) => {
          if (exam.exam !== undefined) {
            return <ExamInput exam={exam} key={"compulsory-exam-" + i} />
          }
          else if (exam.group !== undefined) {
            return <ExamInput group={exam.group} key={"group-exam" + i} />
          }
          else {
            return <ExamInput freeChoiceExam={exam} key={"free-choice-exam" + i} deleteCallback={() => this.handleExamDelete(exam)}/>
          }
        });

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