'use strict';

import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"

import { useEngine } from '../modules/engine'
import api from '../modules/api'
import Exam from '../models/Exam'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

function Group(props) {
    const { controlId, label, ...controlProps } = props;
    return (
        <Form.Group className="mb-3" controlId={props.controlId}>
            <Form.Label>{props.label}</Form.Label>
            {
                props.children === undefined
                    ? <Form.Control {...controlProps} />
                    : props.children
            }
        </Form.Group>
    );
}

export function AddExamPage() {
    const navigate = useNavigate()
    const engine = useEngine()

    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [sector, setSector] = useState('')
    const [credits, setCredits] = useState(0)
    const [tags, setTags] = useState([])
    const [notes, setNotes] = useState('')

    async function submit() {
        try {
            const data = {
                code,
                name,
                sector,
                credits,
                tags,
                notes
            }

            const newId = await api.post(`${Exam.api_url}`, data)
            engine.flashSuccess("L'esame è stato modificato correttamente")

            return navigate(`/exams/${newId}`)
        } catch (err) {
            window.scrollTo(0, 0)
            if (err.code === 403) {
                engine.flashError(`Errore di validazione: ${err.issues}`)
            } else {
                engine.flashError(`${err.code}: ${err.message}`)
            }
        }
    }

    return <>
        <h1>Aggiungi esame</h1>
        <Card>
            <Form>
                <Group
                    controlId="code"
                    label="Codice"
                    type="text"
                    maxLength="6"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                />
                <Group
                    controlId="name"
                    label="Nome"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <Group
                    controlId="sector"
                    label="Settore"
                    type="text"
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                />
                <Group
                    controlId="credits"
                    label="Crediti"
                    type="number"
                    value={credits}
                    onChange={e => setCredits(e.target.value)}
                />


                <Group
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

                <Button onClick={submit}>Salva Esame</Button>
            </Form>
        </Card>
    </>
}
export function EditExamPage() {
    const navigate = useNavigate();
    const engine = useEngine()
    const { id } = useParams()

    const [exam, setExam] = useState(null)
    const query = engine.useGet(Exam, id)

    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [sector, setSector] = useState('')
    const [credits, setCredits] = useState(0)
    const [tags, setTags] = useState([])
    const [notes, setNotes] = useState('')

    async function submit() {
        try {
            const data = {
                code,
                name,
                sector,
                credits,
                tags,
                notes
            }

            await api.post(`${Exam.api_url}${id}`, data)
            await engine.invalidateGet(Exam, id)
            engine.flashSuccess("L'esame è stato modificato correttamente")

            return navigate(`/exams/${id}`)
        } catch (err) {
            console.log("ciao")
            window.scrollTo(0, 0)
            if (err.code === 403) {
                for (const issue in err.res.issues) {
                    engine.flashError(`Errore di validazione: ${err.res.issues[issue]}`)
                }
            } else {
                engine.flashError(`${err.code}: ${err.message}`)
            }
        }
    }

    useEffect(() => {
        if (exam) {
            setCode(exam.code)
            setName(exam.name)
            setSector(exam.sector)
            setCredits(exam.credits)
            setTags(exam.tags)
            setNotes(exam.notes || '')
        }
    }, [exam])

    if (exam === null) {
        if (query.isSuccess) setExam(query.data)
        return <LoadingMessage>caricamento esame...</LoadingMessage>
    }

    return <>
        <h1>Modifica esame</h1>
        <Card>
            <Form>
                <Group
                    controlId="code"
                    label="Codice"
                    type="text"
                    maxLength="6"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                />
                <Group
                    controlId="name"
                    label="Nome"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <Group
                    controlId="sector"
                    label="Settore"
                    type="text"
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                />
                <Group
                    controlId="credits"
                    label="Crediti"
                    type="number"
                    value={credits}
                    onChange={e => setCredits(e.target.value)}
                />


                <Group
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

                <Button onClick={submit}>Aggiorna Esame</Button>
            </Form>
        </Card>
    </>
}

export default function ExamPage() {
    const engine = useEngine()
    const { id } = useParams()
    const [exam, setExam] = useState(null)
    const query = engine.useGet(Exam, id)

    if (exam === null) {
        if (query.isSuccess) setExam(query.data)
        return <LoadingMessage>caricamento esame...</LoadingMessage>
    }

    return <>
        <h1>{exam.name}</h1>
        <Card>
            <div className="d-flex mb-2">
                <Link to="/exams">
                    <button type="button" className="btn btn-sm mr-2 btn-primary">
                        <i className="fas fa-arrow-left mr-2"></i>
                        Tutti gli esami
                    </button>
                </Link>
                <a href={`/exams/edit/${id}`}>
                    <button type="button" className="btn btn-sm mr-2 btn-primary">Modifica</button>
                </a>
                <a href={`/exams/delete/${id}`} onClick={() => confirm('Sei sicuro di voler cancellare questo esame?')}>
                    <button type="button" className="btn btn-sm mr-2 btn-danger">Elimina</button>
                </a>

                <div className="flex-fill"></div>

                <div className="btn btn-sm btn-primary mr-2" type="button" >
                    <i className="fas fa-download mr-2"></i> Esporta in CSV
                </div>
            </div>

            <table className="table">
                <tbody><tr></tr></tbody>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <td>{exam.name}</td>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <th>Codice</th>
                        <td>{exam.code}</td>
                    </tr>
                    <tr>
                        <th>Settore</th>
                        <td>{exam.sector}</td>
                    </tr>
                    <tr>
                        <th>Crediti</th>
                        <td>{exam.credits}</td>
                    </tr>
                    <tr>
                        <th>Tags</th>
                        <td>{exam.tags}</td>
                    </tr>
                    <tr>
                        <th>Note</th>
                        <td>{exam.notes}</td>
                    </tr>
                </tbody>
            </table>
        </Card>

        <Card title="Scelte dell'esame nei piani di studio" >
            <div className="d-flex mb-2">
                <div className="flex-fill"></div>

                <a className="btn btn-sm btn-primary mr-2" type="button" href="130.csv?chosen_exams">
                    <i className="fas fa-download mr-2"></i>
                    Esporta in CSV
                </a>
            </div>

            <table className="table">
                <thead>
                    <tr><th>Piani approvati</th>
                        <th>Anno accademico</th>
                        <th>Curriculum</th>
                        <th>Laurea</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>xyz</td>
                        <td>yyyy/yyyy</td>
                        <td>Bla bla</td>
                        <td>Bla Bla bla</td>
                    </tr>
                </tbody>
            </table>
        </Card>
    </>
}


