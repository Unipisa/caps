'use strict'

import React, {useState} from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"
import { Form, Button } from 'react-bootstrap'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

import { useGet, useEngine, usePatch, usePost } from '../modules/engine'
import FormTemplate from '../models/FormTemplate'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import { RenderHtml } from '../components/RenderHtml'
import Group from '../components/Group'

export default function FormTemplatePage() {
    const { id } = useParams()
    const query = useGet(FormTemplate, id)
    const engine = useEngine()
    const [data, setData] = useState({}) // per l'anteprima
    const user = engine.user
    const vars = {
        "user.firstname": user.firstname || "???",
        "user.lastname": user.lastname || "???",
        "user.email": user.email || "???",
        "user.code": user.id_code || "???",
    }
    
    if (query.isLoading) return <LoadingMessage>caricamento modello...</LoadingMessage> 
    if (query.isError) return <div>errore caricamento modello</div> 
    
    const formTemplate = query.data

    return <>
        <h1>{ formTemplate.name }</h1>
        <Card>
            <div className="d-flex mb-2">
                <Link to="/form_templates">
                    <button type="button" className="btn btn-sm mr-2 btn-primary">
                        <i className="fas fa-arrow-left mr-2"></i>
                        Tutti i modelli
                    </button>
                </Link>
                <Link to={`/form_templates/edit/${id}`}>
                    <button type="button" className="btn btn-sm mr-2 btn-primary">
                        Modifica
                    </button>
                </Link>
                <a href="#" onClick={ () => confirm('Sei sicuro di voler cancellare questo modello?')}>
                    <button type="button" className="btn btn-sm mr-2 btn-danger">Elimina</button>
                </a>

                <div className="flex-fill"></div>

            </div>
            <table className="table">
                <tbody>
                <tr>
                    <th>Attivato</th>
                    <td>{ formTemplate.enabled?"attivo":"non attivo" }</td>
                </tr>
                <tr>
                    <th>Nome</th>
                    <td>{formTemplate.name}</td>
                </tr>
                <tr>
                    <th>Notifiche</th>
                    <td>{formTemplate.notify_emails.join(", ")}</td>
                </tr>
                <tr>
                    <th>Richiede approvazione</th>
                    <td>{formTemplate.requires_approval?"si":"no"}</td>
                </tr>
                <tr>
                    <th>Note</th>
                    <td>{formTemplate.notes}</td>
                </tr>
            </tbody></table>
        </Card>    
        <Card>
            <h2>anteprima</h2>
            <RenderHtml text={formTemplate.text} data={data} setData={setData} vars={vars} />
            <hr />
            <pre>
            {formTemplate.text}
            </pre>
        </Card>
    </>
}

function FormTemplateForm({ submit, formTemplate, isEdit }) {
    const [enabled, setEnabled] = useState(formTemplate.enabled)
    const [name, setName] = useState(formTemplate.name)
    const [require_approval, setRequireApproval] = useState(formTemplate.require_approval)
    const [notify_emails, setNotifyEmails] = useState(formTemplate.notify_emails.join(", "))
    const [notes, setNotes] = useState(formTemplate.notes || '')
    const [text, setText] = useState(formTemplate.text || '')

    const [validation, setValidation] = useState({})

    function onSubmit() {
        submit({ enabled, name, notify_emails, require_approval, notes, text }, setValidation)
    }

    return <>
        <h1>{isEdit ? "Modifica modello" : "Aggiungi modello"}</h1>
        <Card>
            <Form>
                <Group
                    validationError={validation.enabled}
                    controlId="enabled"
                    label="Attivo"
                    type="checkbox"
                    value={enabled}
                    onChange={e => setEnabled(e.target.value)}
                />
                <Group
                    validationError={validation.name}
                    controlId="name"
                    label="Nome"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <Group
                    validationError={validation.require_approval}
                    controlId="require_approval"
                    label="Richiede approvazione"
                    type="checkbox"
                    value={require_approval}
                    onChange={e => setRequireApproval(e.target.value)}
                />
                <Group
                    validationError={validation.notify_emails}
                    controlId="notify_emails"
                    label="Notifiche email (separati da virgola)"
                    type="text"
                    value={notify_emails}
                    onChange={e => setNotifyEmails(e.target.value)}
                />
                <Group 
                    validationError={validation.notes}
                    controlId="notes"
                    label="Note"
                    as="textarea"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />
                <Group 
                    validationError={validation.text}
                    controlId="text"
                    label="Testo"
                    as="textarea"
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
                <Button onClick={onSubmit}>Salva Modello</Button>
            </Form>
        </Card>
    </>
}

export function AddFormTemplatePage() {
    const navigate = useNavigate()
    const engine = useEngine()
    const poster = usePost(FormTemplate)

    const emptyFormTemplate = {
        enabled: false,
        name: '',
        notify_emails: [],
        require_approval: false,
        text: '',
        notes: '',
    }

    function submit(data, setErrors) {
        poster.mutate(
            data,
            {
                onSuccess: (res) => {
                    const newId = res.data
                    engine.flashSuccess("Modello aggiunto con successo")
                    navigate(`/form_templates/${newId}`)
                },
                onError: async (err) => {
                    console.log(`error: ${err} ${err.code}`)
                    if (err.response && err.response.status === 422) {
                        setErrors(err.response.data.issues)
                    } else {
                        engine.flashError(`${err}`)
                    }
                }
            }
        )
    }

    return <FormTemplateForm submit={submit} formTemplate={emptyFormTemplate} />
}

export function EditFormTemplatePage() {
    const navigate = useNavigate();
    const engine = useEngine()

    const { id } = useParams()
    const query = useGet(FormTemplate, id)
    const updater = usePatch(FormTemplate, id)

    function submit(data, setErrors) {
        updater.mutate(
            data,
            {
                onSuccess: () => {
                    engine.flashSuccess("Modello aggiornato con successo")
                    navigate(`/form_templates/${id}`)
                },
                onError: (err) => {
                    if (err.response?.status === 422) {
                        setErrors(err.response.data.issues)
                    } else {
                        engine.flashError(`${err}`)
                    }
                }
            }
        )
    }

    if (query.isLoading) return <LoadingMessage>caricamento...</LoadingMessage>
    if (query.isError) return <div>Errore: {query.error.message}</div>

    const formTemplate = query.data

    return <FormTemplateForm submit={submit} formTemplate={formTemplate} isEdit />
}
