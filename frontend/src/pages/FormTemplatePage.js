'use strict'

import React from 'react'
import { Link, useParams } from "react-router-dom"

import { useGet } from '../modules/engine'
import FormTemplate from '../models/FormTemplate'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import { RenderHtml } from '../components/RenderHtml'

export default function FormTemplatePage() {
    const { id } = useParams()
    const query = useGet(FormTemplate, id)

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
                <a href="#" onClick={ () => confirm('Sei sicuro di voler cancellare questo esame?')}>
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
            <pre>
            {formTemplate.text}
            </pre>
            <hr />
            <RenderHtml text={formTemplate.text} />
        </Card>
    </>
}

function FormTemplateForm({ submit, formTemplate, isEdit }) {
    const [code, setCode] = useState(exam.code)
    const [name, setName] = useState(exam.name)
    const [sector, setSector] = useState(exam.sector)
    const [credits, setCredits] = useState(exam.credits)
    const [tags, setTags] = useState(exam.tags)
    const [notes, setNotes] = useState(exam.notes || '')

    const [validation, setValidation] = useState({})

    function onSubmit() {
        submit({ code, name, sector, credits, tags, notes }, setValidation)
    }

    return <>
        <h1>{isEdit ? "Modifica esame" : "Aggiungi esame"}</h1>
        <Card>
            <Form>
                <Group
                    validationError={validation.code}
                    controlId="code"
                    label="Codice"
                    type="text"
                    maxLength="6"
                    value={code}
                    onChange={e => setCode(e.target.value)}
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
                    validationError={validation.sector}
                    controlId="sector"
                    label="Settore"
                    type="text"
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                />
                <Group
                    validationError={validation.credits}
                    controlId="credits"
                    label="Crediti"
                    type="number"
                    value={credits}
                    onChange={e => setCredits(e.target.value)}
                />
                <Group
                    validationError={validation.tags}
                    controlId="tags"
                    label="Tag (separati da virgola)"
                    type="text"
                    value={tags.join(", ")}
                    onChange={e => setTags(e.target.value.split(", ").map(tag => tag.trim()))}
                />
                <Group label="Note">
                    <Form.Text>Questo messaggio viene mostrato quando lo studente seleziona l'esame nel piano di studi.</Form.Text>
                    <CKEditor
                        id="notes"
                        editor={ClassicEditor}
                        config={{
                            toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList']
                        }}
                        data={notes}
                        onChange={(event, editor) => {
                            const data = editor.getData()
                            setNotes(data)
                            console.log({ event, editor, data })
                        }}
                    />
                </Group>

                <Button onClick={onSubmit}>Salva Esame</Button>
            </Form>
        </Card>
    </>
}

export function AddExamPage() {
    const navigate = useNavigate()
    const engine = useEngine()
    const poster = usePost(Exam)

    const emptyExam = {
        code: '',
        name: '',
        sector: '',
        credits: 0,
        tags: [],
        notes: ''
    }

    function submit(data, setErrors) {
        poster.mutate(
            data,
            {
                onSuccess: (res) => {
                    const newId = res.data
                    engine.flashSuccess("Esame aggiunto con successo")
                    navigate(`/exams/${newId}`)
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

    return <ExamForm submit={submit} exam={emptyExam} />
}

export function EditExamPage() {
    const navigate = useNavigate();
    const engine = useEngine()

    const { id } = useParams()
    const query = useGet(Exam, id)
    const updater = usePatch(Exam, id)

    function submit(data, setErrors) {
        updater.mutate(
            data,
            {
                onSuccess: () => {
                    engine.flashSuccess("Esame aggiornato con successo")
                    navigate(`/exams/${id}`)
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

    const exam = query.data

    return <ExamForm submit={submit} exam={exam} isEdit />
}
