'use strict';

const React = require('react');
const ExamInput = require('./ExamInput');
const ProposalYearNavBar = require('./ProposalYearNavBar');

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

      // If the user has prescribed some exams that have already been
      // chosen, try to match them to the constraints in the curriculum.
      this.state.selected_exams = selected_exams;
      this.matchExamsToCurriculum(this.props.exams);
      this.onSelectedExamsChanged(selected_exams);
    }

    matchExamsToCurriculum(exams) {
      while (exams.length > 0) {
        const e = exams.pop();
        var match = false; // This is set to true if we find a match

        if (e.compulsory_exam_id !== null) {
          const idx = this.state.selected_exams
            .map((e) => e.type == "compulsory_exam" ? e.id : -1)
            .indexOf(e.compulsory_exam_id);

          if (idx > -1) {
            this.state.selected_exams[idx].selection = e.exam;
            match = true;
          }
        }
        else if (e.compulsory_group_id != null) {
          const idx = this.state.selected_exams
          .map((e) => e.type == "compulsory_group" ? e.id : -1)
          .indexOf(e.compulsory_group_id);

          if (idx > -1) {
            this.state.selected_exams[idx].selection = e.exam;
            match = true;
          }
        }
        else {
          const idx = this.state.selected_exams
          .map((e) => e.type == "free_choice_exam" ? e.id : -1)
          .indexOf(e.free_choice_exam_id);

          if (idx > -1) {
            this.state.selected_exams[idx].selection = e.exam;
            match = true;
          }
        }

        if (! match) {
          this.state.selected_exams.push({
            type: "free_choice_exam",
            selection: e.exam,
            "id": "custom-" + this.props.year + "-" + this.id_counter++,
          })
        }
      }
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

        this.onSelectedExamsChanged(selected_exams);
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

        const selected_exams = [ 
          ...this.state.selected_exams.slice(0, idx), 
          exam_copy, 
          ...this.state.selected_exams.slice(idx+1), 
        ];

        this.setState({
          selected_exams: selected_exams
        });

        this.onSelectedExamsChanged(selected_exams);
      }
    }

    onAddExamClicked() {
      this.setState((s) => { 
        const selected_exams = [ 
          ...this.state.selected_exams, 
          { 
            "type": "free_choice_exam",
            "id": "custom-" + this.props.year + "-" + this.id_counter,
            "selection": null
          }
        ];

        this.onSelectedExamsChanged(selected_exams);

        return { 
          selected_exams: selected_exams
        };
      })

      this.id_counter++;
    }

    onAddFreeExamClicked() {
      this.setState((s) => { 
        const selected_exams = [ 
          ...s.selected_exams, 
          { 
            "type": "free_exam",
            "id": "custom-" + this.props.year + "-" + this.id_counter,
            "selection": null
          }
        ];

        this.onSelectedExamsChanged(selected_exams);

        return { 
          selected_exams: selected_exams
        };
      })

      this.id_counter++;
    }

    onSelectedExamsChanged(selected_exams) {
      if (this.props.onSelectedExamsChanged !== undefined) {
        this.props.onSelectedExamsChanged(selected_exams);
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
          const removable = exam.type == "free_choice_exam" || exam.type == "free_exam";
          const deleteCallback = () => this.handleExamDelete(exam);
          const onChangeCallback = (exam, se) => this.handleExamSelected(exam, se);
          return <ExamInput exam={exam} key={"exam-input-" + i} 
                            deleteCallback={removable ? deleteCallback : undefined}
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
                                    <span className={ "credit-block " + credits_color }> {credits}</span>/{required_credits}
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <ProposalYearNavBar year={this.props.year} 
                          onAddExamClicked={this.onAddExamClicked.bind(this)} 
                          onAddFreeExamClicked={this.onAddFreeExamClicked.bind(this)} />
                        {exam_inputs}
                    </div>
                </div>
            </div>
        </div>
    }

}

module.exports = ProposalYear;