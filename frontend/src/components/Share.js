'use strict';

const { formatDate } = require('../modules/dates');
const React = require('react');

class Share extends React.Component {

    render() {
        return <li className="card border-left-warning mb-2">
            <div className="card-body p-1">
                Richiesta di parere inviata a <strong>{this.props.auth.email}</strong> 
                &mdash; 
                {formatDate(this.props.auth.created)}
            </div>
        </li>;
    }


}

module.exports = Share;