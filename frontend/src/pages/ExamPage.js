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

function ControlGroup(props) {
    const { controlId, label, ...controlProps } = props;
    return (
        <Form.Group className="mb-3" controlId={props.controlId}>
            <Form.Label>{props.label}</Form.Label>
            <Form.Control {...controlProps} />
        </Form.Group>
    );
}

export function EditExamPage() {

    const navigate = useNavigate();

    async function submit(id, data) {
        try {
            await api.post(`${Exam.api_url}${id}`, data)
            // TODO: probably should change engine in order to force reload the exam
            return navigate(`/exams/${id}`)
        } catch (err) {
            // TODO: show some UI info on what went wrong (data validation)
            console.log(err)
        }
    }

    const engine = useEngine()
    const { id } = useParams()
    const [exam, setExam] = useState(null)
    const query = engine.useGet(Exam, id)

    const [values, setValues] = useState({
        code: '',
        name: '',
        sector: '',
        credits: 0
    })
    useEffect(() => {
        if (exam) setValues({
            code: exam.code,
            name: exam.name,
            sector: exam.sector,
            credits: exam.credits
        })
    }, [exam])


    if (exam === null) {
        if (query.isSuccess) setExam(query.data)
        return <LoadingMessage>caricamento esame...</LoadingMessage>
    }

    return <>
        <h1>Modifica esame</h1>
        <Card>
            <Form>
                <ControlGroup controlId="code" label="Codice" type="text" maxLength="5" value={values.code} onChange={e => setValues({ ...values, code: e.target.value })} />
                <ControlGroup controlId="name" label="Nome" type="text" value={values.name} onChange={e => setValues({ ...values, name: e.target.value })} />
                <ControlGroup controlId="sector" label="Settore" type="text" value={values.sector} onChange={e => setValues({ ...values, sector: e.target.value })} />
                <ControlGroup controlId="credits" label="Crediti" type="number" value={values.credits} onChange={e => setValues({ ...values, credits: e.target.value })} />

                {/* TODO: sistema tags come dropdown */}
                <ControlGroup controlId="tags" label="Tags" type="text" disabled />
                <ControlGroup controlId="new-tags" label="Nuovi tag (separati da virgola)" type="text" />

                {/* TODO: sistema groups come dropdown */}
                <ControlGroup controlId="groups" label="Gruppi" type="text" disabled />

                <ControlGroup controlId="notes" label="Note" as="textarea" rows="3" />

                <Button onClick={() => submit(id, values)}>Aggiorna Esame</Button>
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

