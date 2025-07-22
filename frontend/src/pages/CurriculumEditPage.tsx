import React, { useState } from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import { useEngine, useGetCurriculum, usePatchCurriculum, usePostCurriculum, useIndexDegree } from '../modules/engine'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import Group from '../components/Group'
import HTMLEditor from '../components/HTMLEditor'

function CurriculumForm({ mutate, curriculum, degrees }) {
    const [data, setData] = useState(curriculum)
    const [validation, setValidation] = useState<any>({})
    const isEdit = curriculum._id !== undefined
    const engine = useEngine()
    const navigate = useNavigate()

    if (!degrees || degrees.length === 0) {
        return <LoadingMessage>Caricamento corsi di laurea...</LoadingMessage>
    }

    return <>
        <h1>{isEdit ? "Modifica curriculum" : "Aggiungi curriculum"}</h1>
        <Card>
            <Form>
                <Group
                    validationError={validation.degree_id}
                    controlId="degree_id"
                    label="Corso di Laurea">
                    <Form.Select 
                        name="degree_id"
                        value={data.degree_id || ''} 
                        disabled={isEdit} // Non permettere cambio corso in modifica
                        onChange={setter("degree_id")}>
                        <option value="">Seleziona corso di laurea</option>
                        {degrees.map(degree => (
                            <option key={degree._id} value={degree._id}>
                                {degree.name} — anno di immatricolazione {degree.academic_year}/{degree.academic_year + 1}
                            </option>
                        ))}
                    </Form.Select>
                </Group>
                
                <Group
                    validationError={validation.name}
                    controlId="name"
                    label="Nome"
                    type="text"
                    value={data.name || ''}
                    onChange={setter("name")}
                />

                <Group controlId="notes" label="Note">
                    <Form.Text>Messaggio mostrato agli studenti quando selezionano questo curriculum.</Form.Text>
                    <HTMLEditor
                        content={data.notes || ''}
                        setContent={notes => setData(data => ({...data, notes}))}>
                    </HTMLEditor>
                </Group>

                {/* Crediti per anno - solo se il corso di laurea è selezionato */}
                {data.degree_id && renderCreditsPerYear()}

                <div className="d-flex gap-2">
                    <Button variant="primary" onClick={submit}>
                        {isEdit ? 'Aggiorna' : 'Crea'}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(isEdit ? `/curricula/${curriculum._id}` : '/curricula')}>
                        Annulla
                    </Button>
                </div>
            </Form>
        </Card>

        {/* Sezioni per gestione esami - solo in modalità modifica */}
        {isEdit && (
            <>
                <Card title="Esami Obbligatori">
                    <p>Gestione esami obbligatori del curriculum</p>
                    {/* TODO: Implementare gestione esami obbligatori */}
                </Card>

                <Card title="Esami Obbligatori a Scelta in un Gruppo">
                    <p>Gestione gruppi di esami a scelta obbligatoria</p>
                    {/* TODO: Implementare gestione gruppi obbligatori */}
                </Card>

                <Card title="Esami a Scelta Libera">
                    <p>Gestione esami a scelta libera</p>
                    {/* TODO: Implementare gestione esami a scelta libera */}
                </Card>
            </>
        )}
    </>

    function renderCreditsPerYear() {
        const selectedDegree = degrees.find(d => d._id === data.degree_id)
        if (!selectedDegree) return null

        const years = selectedDegree.years || 3 // Default a 3 anni
        const currentYears = data.years || []
        
        // Assicuriamoci che ci siano abbastanza anni definiti
        while (currentYears.length < years) {
            currentYears.push({ credits: 60, exams: [] })
        }

        return (
            <Card title="Crediti per Anno">
                {Array.from({length: years}, (_, i) => (
                    <Group
                        key={`year-${i}`}
                        validationError={validation[`years.${i}.credits`]}
                        controlId={`credits_${i}`}
                        label={`Anno ${i + 1}`}
                        type="number"
                        value={currentYears[i]?.credits || 60}
                        onChange={e => {
                            const newYears = [...currentYears]
                            if (!newYears[i]) newYears[i] = { credits: 60, exams: [] }
                            newYears[i].credits = parseInt(e.target.value) || 0
                            setData(data => ({...data, years: newYears}))
                        }}
                    />
                ))}
            </Card>
        )
    }

    function submit() {
        // Validazione base
        if (!data.degree_id) {
            setValidation({degree_id: "Seleziona un corso di laurea"})
            return
        }
        if (!data.name?.trim()) {
            setValidation({name: "Il nome è obbligatorio"})
            return
        }

        mutate(data, {
            onSuccess: (res) => {
                engine.flashSuccess(isEdit 
                    ? "Curriculum aggiornato con successo"
                    : "Curriculum aggiunto con successo")
                const id = isEdit ? curriculum._id : res.data
                navigate(`/curricula/${id}`)
            },
            onError: (err) => {
                if (err.response?.status === 422) {
                    setValidation(err.response.data.issues || {})
                } else {
                    engine.flashError(`Errore: ${err.message || err}`)
                }
            }
        })
    }

    function setter(field) {
        return e => setData(data => ({...data, [field]: e.target.value}))
    }
}

export function EditCurriculumPage() {
    const { id } = useParams()
    const curriculumQuery = useGetCurriculum(id || '')
    const degreesQuery = useIndexDegree()
    const mutate = usePatchCurriculum(id || '')

    if (curriculumQuery.isError) return <div>Errore caricamento curriculum</div>
    if (degreesQuery.isError) return <div>Errore caricamento corsi di laurea</div>
    if (curriculumQuery.isLoading || degreesQuery.isLoading) {
        return <LoadingMessage>Caricamento...</LoadingMessage>
    }

    return <CurriculumForm 
        mutate={mutate.mutate} 
        curriculum={curriculumQuery.data} 
        degrees={degreesQuery.data?.items || []}
    />
}

export function AddCurriculumPage() {
    const degreesQuery = useIndexDegree()
    const mutate = usePostCurriculum()

    if (degreesQuery.isError) return <div>Errore caricamento corsi di laurea</div>
    if (degreesQuery.isLoading) {
        return <LoadingMessage>Caricamento corsi di laurea...</LoadingMessage>
    }

    return <CurriculumForm 
        mutate={mutate.mutate} 
        curriculum={{}} 
        degrees={degreesQuery.data?.items || []}
    />
}

export default function CurriculumPage() {
    // Questo è il componente di visualizzazione, già esistente
    return <div>Curriculum view page - già implementata</div>
}
