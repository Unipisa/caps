'use strict';

const React = require('react');

class Card extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="row my-2">
            <div className="col">
                <div className="card shadow">
                    <div className="card-body">
                        {this.props.children}
                    </div>
                </div>
            </div>
        </div>;
    }
}

module.exports = Card;