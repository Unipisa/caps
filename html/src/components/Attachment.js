'use strict';

const React = require('react');

const { formatDate } = require('../modules/dates');

class Attachment extends React.Component {

    render() {
        return <li className="card border-left-info mb-2">
            <div className="card-body p-1">
                {this.props.attachment.comment} <br></br>
                <strong>{this.props.attachment.user.name}</strong> &mdash;
                {formatDate(this.props.attachment.created)}
            </div>
        </li>;
    }

}

module.exports = Attachment;