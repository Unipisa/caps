'use strict';

import React from 'react';
import { formatDate } from '../modules/dates';

function Attachment({ root, controller, onDeleteClicked, attachment, showDeleteButton}) {
    const api_base = root + (controller || 'attachments');

    const deleteHandler = () => {
        if (onDeleteClicked) {
            onDeleteClicked(attachment);
        }
    }
    
    if (attachment.type === 'auth') {
        return <li class="card border-left-warning mb-2">
            <div class="card-body p-1">
            Richiesta di parere inviata a <strong>{attachment.email}</strong>
            &mdash; {formatDate(attachment.created)}
            </div>
        </li>
    } else {
        return <li className="card border-left-info mb-2">
            <div className="card-body p-1">
                {attachment.comment != "" && 
                    <div>{attachment.comment}</div>
                }
                {attachment.filename !== undefined && <div>
                    <a href={api_base + '/view/' + attachment.id}>{attachment.filename}</a>
                </div>}
                <div className="d-sm-flex align-items-center justify-content-between">
                    <div>
                        <strong>{attachment.user.name}</strong> &mdash;
                        {formatDate(attachment.created)}
                    </div>
                    {showDeleteButton && <button className="btn btn-sm btn-danger" onClick={deleteHandler}>Elimina</button>}
                </div>
            </div>
        </li>
    }
}

export default Attachment;