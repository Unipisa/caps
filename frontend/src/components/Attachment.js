'use strict';

import React from 'react';
import { formatDate } from '../modules/dates';

class Attachment extends React.Component {

    render() {
        const api_base = this.props.root + ((this.props.controller !== undefined) ? this.props.controller : 'attachments');

        return <li className="card border-left-info mb-2">
            <div className="card-body p-1">
                {this.props.attachment.comment != "" && 
                    <div>{this.props.attachment.comment}</div>
                }
                {this.props.attachment.filename !== undefined && <div>
                    <a href={api_base + '/view/' + this.props.attachment.id}>{this.props.attachment.filename}</a>
                </div>}
                <strong>{this.props.attachment.user.name}</strong> &mdash;
                {formatDate(this.props.attachment.created)}
            </div>
        </li>;
    }

}

export default Attachment;