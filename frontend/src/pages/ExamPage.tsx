import React, { useState } from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import { useEngine, useDeleteExam, 
    useGetExam, usePatchExam, usePostExam } from '../modules/engine'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import Group from '../components/Group'
import HTMLEditor from '../components/HTMLEditor'

function ExamForm({ mutate, exam }) {
    const [data, setData] = useState(exam)
    const [validation, setValidation] = useState<any>({})
    const isEdit = exam._id !== undefined
    const engine = useEngine()
    const navigate = useNavigate()

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
                    value={data.code || ''}
                    onChange={setter("code")}
                />
                <Group
                    validationError={validation.name}
                    controlId="name"
                    label="Nome"
                    type="text"
                    value={data.name || ''}
                    onChange={setter("name")}
                />
                <Group
                    validationError={validation.sector}
                    controlId="sector"
                    label="Settore"
                    type="text"
                    value={data.sector || ''}
                    onChange={setter("sector")}
                />
                <Group
                    validationError={validation.credits}
                    controlId="credits"
                    label="Crediti"
                    type="number"
                    value={data.credits || ''}
                    onChange={setter("credits")}
                />
                <Group
                    validationError={validation.tags}
                    controlId="tags"
                    label="Tag (separati da virgola)"
                    type="text"
                    value={(data.tags || []).join(", ")}
                    onChange={e => setData(data => ({...data, tags: e.target.value.split(", ").map(tag => tag.trim())}))}
                />
                <Group controlId="notes" label="Note" style={{".mce-notification": {"display": 'none !important',}}}>
                    <Form.Text>Questo messaggio viene mostrato quando lo studente seleziona l'esame nel piano di studi.</Form.Text>

                    <HTMLEditor
                        content={data.notes || ''}
                        setContent={notes => setData(data => ({...data, notes}))}>
                    </HTMLEditor>
                </Group>
                <Button onClick={submit}>Salva Esame</Button>
            </Form>
        </Card>
    </>

    function submit() {
        mutate(data,
            {
                onSuccess: (res) => {
                    engine.flashSuccess(isEdit 
                        ? "Esame aggiornato con successo"
                        : "Esame aggiunto con successo")
                    const id = isEdit ? exam._id : res.data
                    navigate(`/exams/${id}`)
                },
                onError: (err) => {
                    if (err.response?.status === 422) {
                        setValidation(err.response.data.issues)
                    } else {
                        engine.flashError(`${err}`)
                    }
                }
            }
        )
    }

    function setter(field) {
        return e => setData(data => ({...data, [field]: e.target.value}))
    }
}

export function EditExamPage() {
    const { id } = useParams()
    const isNew = id === '__new__'
    const query = useGetExam(id || '')
    const updater = usePatchExam(id || '')
    const poster = usePostExam()
    const mutate = isNew ? poster.mutate : updater.mutate

    if (query.isLoading) return <LoadingMessage>caricamento...</LoadingMessage>
    if (query.isError) return <div>Errore: {query.error.message}</div>

    return <ExamForm mutate={mutate} exam={query.data} />
}

export default function ExamPage() {
    const engine = useEngine()
    const { id } = useParams()
    const query = useGetExam(id || '')

    const navigate = useNavigate()
    const deleter = useDeleteExam(id || '')

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

    if (query.isError) return <div>Errore: {query.error.message}</div>
    if (query.data === undefined) return <LoadingMessage>caricamento esame...</LoadingMessage>

    const exam = query.data

    if (exam === null) return <LoadingMessage>cancellazione esame...</LoadingMessage>

    return <>
        <h1>{exam.name}</h1>
        <Card>
            <div className="d-flex mb-2">
                <Link to="/exams/">
                    <button type="button" className="btn btn-sm mr-2 btn-primary">
                        <i className="fas fa-arrow-left mr-2"/>
                        Tutti gli esami
                    </button>
                </Link>
                <Link to={`/exams/edit/${id}`}>
                    <button type="button" className="btn btn-sm mr-2 btn-primary">Modifica</button>
                </Link>
                <button
                    type="button"
                    className="btn btn-sm mr-2 btn-danger"
                    onClick={deleteExam}>
                        Elimina
                </button>

                <div className="flex-fill"></div>

                <div className="btn btn-sm btn-primary mr-2">
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


