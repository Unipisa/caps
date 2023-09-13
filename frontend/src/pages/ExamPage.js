'use strict';

import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"

import { useEngine, useGet, usePost, useDelete, usePatch } from '../modules/engine'
import Exam from '../models/Exam'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

function Group({ controlId, label, validationError, children, ...controlProps }) {
    return (
        <Form.Group className="mb-3" controlId={controlId} >
        <Form.Label>{label}</Form.Label>
        {
            children === undefined
            ? <Form.Control
            {...controlProps}
            className={validationError ? "border border-danger" : ""}
            />
            : children
        }
        {validationError && <Form.Label className="mb-0 text-danger">{validationError}</Form.Label>}
        </Form.Group>
    );
}

function ExamForm({ submit, exam, isEdit }) {
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

export default function ExamPage() {
    const engine = useEngine()
    const { id } = useParams()
    const query = useGet(Exam, id)

    const exam = query.data

    const navigate = useNavigate()
//    const deleter = engine.useDelete(Exam, id)
    const deleter = useDelete(Exam, id)

    function deleteExam() {
        if (!confirm("Sei sicuro di voler cancellare questo esame?"))
            return false;

        deleter.mutate(id, {
            onSuccess: () => {
                engine.flashSuccess("Esame cancellato con successo")
                navigate('/exams')
            },
            onError: (err) => {
                engine.flashError(`${err}`)
            }
        })
    }

    if (query.isLoading) {
        return <LoadingMessage>caricamento esame...</LoadingMessage>
    }

    if (query.isError) {
        return <div>Errore: {query.error.message}</div>
    }

    if (exam === null) return <LoadingMessage>cancellazione esame...</LoadingMessage>

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
                <Link to={`/exams/edit/${id}`}>
                    <button type="button" className="btn btn-sm mr-2 btn-primary">Modifica</button>
                </Link>
                <button
                    type="button"
                    className="btn btn-sm mr-2 btn-danger"
                    onClick={deleteExam}
                >
                    Elimina
                </button>

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


