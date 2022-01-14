'use strict';

const React = require('react');

class Card extends React.Component {

    constructor(props) {
        super(props);
    }

    renderTitle() {
        return <div className="card-header bg-primary">
                <h3 className="h5 text-white">{this.props.title}</h3>
        </div>;
    }

    render() {
        return <div className="row my-2">
            <div className="col">
                <div className="card shadow">
                    { this.props.title  && this.renderTitle() }
                    <div className="card-body">
                        {this.props.children}
                    </div>
                </div>
            </div>
        </div>;
    }
}

module.exports = Card;