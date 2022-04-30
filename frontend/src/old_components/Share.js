'use strict';

import { formatDate } from '../modules/dates';
import React from 'react';

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

export default Share;