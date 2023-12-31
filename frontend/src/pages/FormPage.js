'use strict'

import React from 'react'
import { useParams } from "react-router-dom"

import { useGet } from '../modules/engine'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import {formatDate} from '../modules/dates'

function compile_html(text, form) {
    const user_data = {
        'firstname': form.user_first_name,
        'lastname': form.user_last_name,
        'code': form.user_id_number,
        'email': form.user_email,
        'username': form.user_username,
    }

    return text.replace(/{\s*user\.([A-Za-z_]*)\s*}/g, (match, s) => user_data[s])
}


function Badges({ form, formTemplate }) {
    let badges = []

    if (form === null)
        return badges

    if (form.date_submitted) {
        badges.push(<span key="submitted-badge" className="badge badge-secondary mr-2 mb-2">
            Inviato il {formatDate(form.date_submitted)}
        </span>)
    }

    if (form.state === "approved") {
        badges.push(<span key="approved-badge" className="badge badge-success mr-2 mb-2">
            Approvato il {formatDate(form.date_managed)}
        </span>)
    }

    if (form.state === "rejected") {
        badges.push(<span key="rejected-badge" className="badge badge-danger mr-2 mb-2">
            Rifiutato il {formatDate(form.date_managed)}
        </span>)
    }

    if (! formTemplate.require_approval) {
        badges.push(<span key="no-approval-badge" className="badge badge-success mr-2 mb-2">
            Questo modulo non richiede l'approvazione
        </span>);
    }

    return <>{badges}</>
}

/*
 * If the form is in a draft state, and we are in the view action, then show a warning
 * for the user, as he/she needs to submit the form before it can be properly evaluated.
 */
function DraftNotice({edit, form}) {
    return <div className="card shadow border-left-warning mb-2">
        <div className="card-body">
            <p>Questo modulo è una bozza: è necessario modificarlo ed inviarlo perché venga valutato.</p>
            <a href={"?edit"}>
                <button className="btn btn-primary btn-sm">Modifica</button>
            </a>
        </div>
    </div>;
}

export default function FormPage() {
    const { id } = useParams()
    const edit = false
    const queryForm = useGet("forms/", id)
    const form = queryForm.data
    const queryFormTemplate = useGet("form_templates/", form ? form.form_template_id : null)

    if (queryForm.isLoading || queryFormTemplate.isLoading) return <LoadingMessage>caricamento modulo...</LoadingMessage>
    if (queryForm.isError || queryFormTemplate.isError) return <div>errore caricamento modulo</div> 

    const formTemplate = queryFormTemplate.data
    //  if (formTemplate === null) return <TemplateSelection />

    return <Card title={form.form_template_name}>
        <Badges form={form} formTemplate={formTemplate}></Badges>
            {!edit && form.state==="draft" && 
                <DraftNotice edit={edit} form={form}></DraftNotice>}
            <div id="form-div" className="form-form" >
            <div key="form-div" dangerouslySetInnerHTML={{ __html: compile_html(formTemplate.text, form) }} ></div>
            </div>
        { edit && 
        <div className="form-group btn-group mt-4">
            <button onClick={evt => onSave('submit', evt)} className="btn btn-success">Invia</button>
            <button onClick={evt => onSave('save', evt)} className="btn btn-primary">Salva bozza</button> 
        </div>
        } 
    </Card>;
}

