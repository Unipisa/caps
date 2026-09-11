import React from "react";

import $ from 'jquery';
import 'bootstrap';

import unique_id from '../modules/unique_id';

function NewAttachmentForm(props) {
    const comment_ref = React.createRef();
    const attachment_ref = React.createRef();

    // We use the IDs for JQuery interaction and labels
    const collapse_id = 'collapse-' + unique_id();
    const comment_id = 'comment-' + unique_id();

    const newAttachmentCallback = () => {
        if (props.onNewAttachment) {
            // Get the data from the form, and propagate the event  
            const comment = comment_ref.current.value;
            if (attachment_ref.current.files.length > 0) {
                const selected_file = attachment_ref.current.files[0];
                const fr = new FileReader();
                fr.onload = (c) => {
                    props.onNewAttachment({
                        'comment': comment, 
                        'data': btoa(fr.result),
                        'filename': selected_file.name, 
                        'mimetype': selected_file.type == '' ? 'application/octet-stream' : selected_file.type
                    });
                };
                fr.readAsBinaryString(selected_file);
            }
            else {
                props.onNewAttachment({
                    'comment': comment, 
                    'data': null, 
                    'filename': null,
                    'mimetype': ''
                })
            }
        }

        // Reset the form and hide the dropdown
        comment_ref.current.value = '';
        attachment_ref.current.value = '';
        $('#' + collapse_id).collapse('hide');
    }

    return <>
        <button type="button" className="dropdown-toggle btn btn-primary btn-sm" data-toggle="collapse" data-target={"#" + collapse_id}>
        Inserisci un nuovo allegato
        </button>
        <div className="collapse my-3 mx-0" id={collapse_id}>
            <div className="card border-left-primary p-3">
                <label htmlFor={comment_id}>Commento:</label>
                <div className="form-group">
                    <textarea id={comment_id} ref={comment_ref} className="form-control"></textarea>
                </div>
                <div className="form-group">
                    <input ref={attachment_ref} type="file" className="form-control-file"></input>
                </div>
                <button className="btn btn-primary" onClick={newAttachmentCallback}>Aggiungi allegato o commento</button>
            </div>
        </div>
    </>;
}

export default NewAttachmentForm;