'use strict';

const React = require('react');
const ExamInput = require('./ExamInput');
const ProposalYearNavBar = require('./ProposalYearNavBar');

class ProposalYear extends React.Component {

    constructor(props) {
        super(props);
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

    render() {
        const title = this.getTitle();
        const required_credits = this.props.curriculum.credits[this.props.year - 1];
        const credits = 0;
        const credits_color = this.getCreditsColor(credits, required_credits);

        // We build the list of exams that are needed for this year; they are 
        // rendered differently depending if they are compulsory exams, exams
        // in a group, or free choice ones. 
        var compulsory_exams = this.props.curriculum.compulsory_exams
            .filter((e) => e.year == this.props.year)
            .map((exam, i) => 
                <ExamInput exam={exam} key={"compulsory-exam-" + i} />
            );

        var group_exams = this.props.curriculum.compulsory_groups
            .filter((e) => e.year == this.props.year)
            .map((exam, i) => 
                <ExamInput group={exam.group} key={"group-exam" + i} />
            );

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
                        {compulsory_exams}
                        {group_exams}
                    </div>
                </div>
            </div>
        </div>
    }

}

module.exports = ProposalYear;