'use strict';

import React from 'react';
import { formatDate } from '../modules/dates';

function Attachment(props) {
    const api_base = props.root + ((props.controller !== undefined) ? props.controller : 'attachments');

    const deleteHandler = () => {
        if (props.onDeleteClicked) {
            props.onDeleteClicked(props.attachment);
        }
    }

    return <li className="card border-left-info mb-2">
        <div className="card-body p-1">
            {props.attachment.comment != "" && 
                <div>{props.attachment.comment}</div>
            }
            {props.attachment.filename !== undefined && <div>
                <a href={api_base + '/view/' + props.attachment.id}>{props.attachment.filename}</a>
            </div>}
            <div className="d-sm-flex align-items-center justify-content-between">
                <div>
                    <strong>{props.attachment.user.name}</strong> &mdash;
                    {formatDate(props.attachment.created)}
                </div>
                {props.showDeleteButton && <button className="btn btn-sm btn-danger" onClick={deleteHandler}>Elimina</button>}
            </div>
        </div>
    </li>;
}

export default Attachment;