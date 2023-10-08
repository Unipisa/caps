'use strict'

import React, { useState } from 'react'
import { useParams } from "react-router-dom"

import { useEngine, useGet, useIndex } from '../modules/engine'
import Proposal from '../models/Proposal'
import Curriculum from '../models/Curriculum'
import Degree from '../models/Degree'
import Exam from '../models/Exam'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import {Button} from 'react-bootstrap' 

function ExamRow({ exam }) {
    const query = useGet(Exam, exam.exam_id || null)
    if (query.isLoading) return <tr><td>loading...</td></tr>
    if (query.isError) return <tr><td>error...</td></tr>
    const real_exam = query.data
    return <tr>
        <td>{exam.exam_code}</td>
        <td>{exam.exam_name}
            {real_exam && real_exam.tags.map(tag => 
                <div key={tag} className="badge ml-1 badge-secondary badge-sm">
                    {tag}
                </div>)}
        </td>
        <td>{exam.exam_sector}</td>
        <td>{exam.exam_credits}</td>
        <td>{{
            'CompulsoryExam': 'Obbligatorio',
            'CompulsoryGroup': exam.group,
            'FreeChoiceGroup': 'A scelta libera (G)',
            'FreeChoiceExam': 'A scelta libera',
            'ExternalExam': 'Esame Esterno',
        }[exam.__t]}
        </td>
    </tr>
}

function ExamSelect({ exam, exams, groups }) {
    if (exam.__t === "CompulsoryExam") {
        const compulsoryExam = exams[exam.exam_id]
        return <li className='form-group exam-input'>
            <div className='row'>
                <div className='col-9'>
                    <select className='form-control' disabled>
                        <option>{compulsoryExam.name}</option>
                    </select>
                </div>
                <div className="col-3">
                    <input className='form-control col' readOnly />
                </div>
            </div>
        </li>
    } else if (exam.__t === "CompulsoryGroup") {
        const options = groups[exam.group]
        return <li className='form-group exam-input'>
            <div className='row'>
                <div className='col-9'>
                    <select className='form-control' disabled={exam.__t === "CompulsoryExam"} defaultValue={-1}>
                        <option disabled value={-1}>Un esame a scelta nel gruppo {exam.group}</option>
                        {options.map(opt => <option key={opt._id}>{opt.name}</option>)}
                    </select>
                </div>
                <div className="col-3">
                    <input className='form-control col' readOnly />
                </div>
            </div>
        </li>
    } else if (exam.__t === "FreeChoiceExam") {
        const options = Object.values(exams).sort((a, b) => a.name > b.name)
        return <li className='form-group exam-input'>
            <div className='row'>
                <div className='col-9'>
                    <select className='form-control' disabled={exam.__t === "CompulsoryExam"} defaultValue={-1}>
                        <option disabled value={-1}>Un esame a scelta libera</option>
                        {options.map(opt => <option key={opt._id}>{opt.name}</option>)}
                    </select>
                </div>
                <div className="col-2">
                    <input className='form-control col' readOnly />
                </div>
                <div className='col-1 btn my-auto'>
                    <i className='fas fa-trash'></i>
                </div>
            </div>
        </li>
    }
}

function YearCard({ year, number, exams, groups }) {
    const yearName = ["Primo", "Secondo", "Terzo"][number] || `#${number}`

    const customHeader = <div className='d-flex justify-content-between align-content-center'>
        <h5 className='text-white'>{yearName} anno</h5>
        <h5 className='text-white'>
            Crediti: ???/{year.credits}
        </h5>
    </div>

    return <Card customHeader={customHeader} >
        {year.exams.map(exam => <ExamSelect key={exam._id} exam={exam} exams={exams} groups={groups}/>)}
        <div className='d-flex flex-row-reverse'>
            <button className='btn btn-primary'>Aggiungi esame esterno</button>
            <button className='btn btn-primary mr-2'>Aggiungi esame a scelta libera</button>

        </div>
    </Card>
}

export function NewProposalPage() {
    const engine = useEngine()
    const empty = new Proposal({
        state: 'draft',

        degree_id: null,
        curriculum_id: null,

        user_id: engine.user._id,
        user_name: engine.user.name,
        user_first_name: engine.user.first_name,
        user_last_name: engine.user.last_name,
        user_id_number: engine.user.id_number,
        user_email: engine.user.email,
        user_username: engine.user.username,

        exams: [],
        
        attachments: []
    })

    const [proposal, setProposal] = useState(empty)

    const degreesQuery = useIndex(Degree, null)
    const curriculaQuery = useIndex(Curriculum, proposal.degree_id ? { degree_id: proposal.degree_id } : null )
    const examsQuery = useIndex(Exam, null)

    if (degreesQuery.isLoading) return <LoadingMessage>caricamento corsi di laurea...</LoadingMessage>
    if (degreesQuery.isError) return <LoadingMessage>errore corsi di laurea...</LoadingMessage>

    const degrees = Object.fromEntries(degreesQuery.data.items.map(d => [d._id, new Degree(d)]))

    if (curriculaQuery.isLoading) return <LoadingMessage>caricamento curricula...</LoadingMessage>
    if (curriculaQuery.isError) return <LoadingMessage>errore curricula...</LoadingMessage>

    const curricula = Object.fromEntries(curriculaQuery.data.items.map(c => [c._id, c]))

    if (examsQuery.isLoading) return <LoadingMessage>caricamento esami...</LoadingMessage>
    if (examsQuery.isError) return <LoadingMessage>errore esami...</LoadingMessage>

    const exams = Object.fromEntries(examsQuery.data.items.map(e => [e._id, e]))

    const degree = proposal.degree_id ? degrees[proposal.degree_id] : null
    const curriculum = proposal.curriculum_id ? curricula[proposal.curriculum_id] : null

    const groups = degree ?
        Object.fromEntries(
            Object.entries(degree.groups).map(([group_id, group_exams]) => {
                const populated_exams = group_exams.flatMap(id => exams[id] ? [ exams[id] ] : [] ).sort((a, b) => a.name > b.name )
                return [group_id, populated_exams]
            })
        ) :
        {}

    return <>
        <Card>
            <div className="form-group" key="degree-selection">
                <select className="form-control mb-3"
                    onChange={e => setProposal({ ... proposal, degree_id: e.target.value })}
                    value={proposal.degree_id || -1}
                >
                    <option key="degree-dummy" value="-1" disabled>
                        Selezionare il corso di Laurea
                    </option>
                    {
                        Object.values(degrees).sort(
                            (a,b) => a.academic_year < b.academic_year || (a.academic_year === b.academic_year && a.name > b.name)
                        ).map((degree) => 
                                <option key={degree._id} value={degree._id}>
                                    {degree.name} &mdash; anno di immatricolazione {degree.academic_years()}
                                </option>
                        )
                    }
                </select>
                
                {
                    proposal.degree_id && <>
                        <select className="form-control mb-3"
                            onChange={e => setProposal({ ... proposal, curriculum_id: e.target.value })}
                            value={proposal.curriculum_id || -1}
                        >
                            <option key="curriculum-dummy" value="-1" disabled>
                                Selezionare il Curriculum
                            </option>
                            {
                                Object.values(curricula).sort((a, b) => a.name > b.name).map(curriculum =>
                                        <option key={curriculum._id} value={curriculum._id}>
                                            {curriculum.name}
                                        </option>
                                )
                            }
                        </select>
                    </>
                }

            </div>
        </Card>
        {
            proposal.degree_id && proposal.curriculum_id && curriculum && <>
                {
                    curriculum.years.map((year, number) => <YearCard key={number} year={year} exams={exams} number={number} groups={groups}/>)
                }
            </>
        }
    </>
}

export function EditProposalPage() {
    const { id } = useParams()
    // const engine = useEngine()
    // const empty = new Proposal({
    //     curriculum_id: null,
    //     user_name: engine.user.name,
    //     state: 'draft',
    // })
    //
    // const [curriculum_id, setCID] = useState("64f0b8114fb5ed574a7b6fce")
    // const curriculumQuery = useGet(Curriculum, curriculum_id)
    // return <div>
    //     <p>{curriculumQuery.isSuccess && curriculumQuery.data.name}</p>
    //     <button onClick={() => setCID("64f0b8114fb5ed574a7b7217")}>ehi</button>
    // </div>

    const engine = useEngine()
    const [proposal, setProposal] = useState(new Proposal({
        curriculum_id: null,
        user_id: engine.user._id,
        state: 'draft'
    }))
    const query = useGet(Proposal, id || '__new__')

    if (query.isLoading) return <LoadingMessage>caricamento piano di studi...</LoadingMessage>
    if (query.isError) return <LoadingMessage>errore piano di studi...</LoadingMessage>

    const original_proposal = query.data

    return <EditProposalInternal original_proposal={original_proposal} />

    return <>
        Proposal: {JSON.stringify(original_proposal)}
    </>

    console.log(query.data)
    // const proposal = id ? ( query.isSuccess ? new Proposal(query.data) : null ) : empty
    // const curriculumQuery = useGet(Curriculum, (proposal && proposal.curriculum_id) ? proposal.curriculum_id : null)
    // const curriculum = curriculumQuery.isSuccess ? new Curriculum(curriculumQuery.data) : null
    // const degreeQuery = useGet(Degree, curriculum ? curriculum.degree_id : null)
    // const degree = degreeQuery.isSuccess ? new Degree(degreeQuery.data) : null
    const degreesQuery = useIndex(Degree, {})
    const degrees = degreesQuery.isSuccess ? degreesQuery.data.items : null

    // if (proposal === null || (proposal.curriculum_id && (curriculum === null || degree === null))) {
    //     return <LoadingMessage>caricamento piano di studi...</LoadingMessage>
    // }

    if (degrees === null) {
        return <LoadingMessage>caricamento corsi di laurea...</LoadingMessage>
    }

    // function MessageCard() {
    //     return <Card className={
    //         {
    //             'draft': "border-left-primary",
    //             'submitted': "border-left-warning",
    //             'approved': "border-left-success",
    //             'rejected': "border-left-error",
    //         }[proposal.state]
    //     }>{
    //         {
    //             'draft': `Questo piano è in stato di bozza. Devi inviarlo per avere l'approvazione.`,
    //             'submitted': `Il piano è stato inviato in data ${proposal.date_submitted.format("D.M.Y")}. Riceverai un email quando verrà approvato o rifiutato`,
    //             'approved': `Il piano è stato approvato in data ${proposal.date_managed.format("D.M.Y")}.`,
    //             'rejected': `Il piano è stato rigettato in data ${proposal.date_managed.format("D.M.Y")}. Puoi farne una copia, modificarlo e inviarlo nuovamente.`,
    //         }[proposal.state]
    //     }</Card>
    // }

    function Year({year}) {
        return <Card title={`${Curriculum.ordinal(year)} anno`}>
            <table className="table">
                <thead>
                <tr>
                    <th>Codice</th>
                    <th>Nome</th>
                    <th>Settore</th>
                    <th>Crediti</th>
                    <th>Gruppo</th>
                </tr>
                </thead>
                <tbody>
                { proposal.exams
                    .filter(e => e.year === year)
                    .map(e => <ExamRow key={e._id} exam={e}/>)
                }
                </tbody>
            </table>
        </Card>
    }

    function InfoCard() {
        if (degrees === null) {
            return <Card><p>caricamento...</p></Card>
        }

        return <Card>
            <div className="form-group" key="degree-selection">
                <select className="form-control" onChange={() => {}}
                    value={degree ? degrees.map((d) => d.id).indexOf(degree._id) : -1}>
                    <option key="degree-dummy" value="-1">
                        Selezionare il corso di Laurea
                    </option>
                    {degrees.map(degree => [
                        degree.academic_year, degree.name, 
                        <option key={degree._id} value={degree._id}>
                            {degree.name} &mdash; anno di immatricolazione {degree.academic_years()}
                        </option>]).sort().map(([a,b,rendering]) => rendering)}
                </select>
            </div>
        </Card>
    }

    return <>
        <h1>Piano di studi di {proposal.user_name}</h1>
        {/* <MessageCard /> */}
        <InfoCard />
        { degree && [...Array(degree.years).keys()].map(year => <Year key={year} year={year+1}/>)}
    </>

}

function EditProposalInternal({original_proposal}) {
    const [proposal, setProposal] = useState(original_proposal)
    console.log('original_proposal', original_proposal)
    if (!proposal.curriculum_id) {
        return <ChooseCurriculum />
    }

    return <>
        Proposal: {JSON.stringify(original_proposal)}
    </>
}

function ChooseCurriculum({}) {
    const curriculum_query = useIndex(Curriculum, {})
    if (curriculum_query.isLoading) return <LoadingMessage>caricamento...</LoadingMessage>
    if (curriculum_query.isError) return <LoadingMessage>errore...</LoadingMessage>
    const curricula = curriculum_query.data.items

    return <>
        curricula: {JSON.stringify(curricula)}
    </>
}


export default function ProposalPage() {
    const engine = useEngine()
    const { id } = useParams()
    // console.log(`ProposalPage id=${id || null}`)
    const empty = new Proposal({
        curriculum_id: null,
        user_name: engine.user.name,
        state: 'draft',
    })
    const edit = id ? false : true
    const query = useGet(Proposal, id || null)
    const proposal = id ? ( query.isSuccess ? new Proposal(query.data) : null ) : empty
    const curriculumQuery = useGet(Curriculum, (proposal && proposal.curriculum_id) ? proposal.curriculum_id : null)
    console.log('ehi', proposal, curriculumQuery)
    const curriculum = curriculumQuery.isSuccess ? new Curriculum(curriculumQuery.data) : null
    const degreeQuery = useGet(Degree, curriculum ? curriculum.degree_id : null)
    const degree = degreeQuery.isSuccess ? new Degree(degreeQuery.data) : null
    const degreesQuery = useIndex(Degree, edit ? {} : false)
    const degrees = degreesQuery.isSuccess ? degreesQuery.data.items : null

    // console.log(`proposal: ${JSON.stringify(proposal)}`)
    // console.log(`curriculum: ${JSON.stringify(curriculum)}`)
    // console.log(`degree: ${JSON.stringify(degree)}`)

    if (proposal === null || (proposal.curriculum_id && (curriculum === null || degree === null))) {
        return <LoadingMessage>caricamento piano di studi...</LoadingMessage>
    }

    function AdminButtons() {
        if (!edit && engine.user.admin && proposal.state === 'submitted') return <>
            <Button>accetta</Button>
            <Button>rifiuta</Button>
        </>       
        return null
    }

    function ShareButton() {
        if (!edit && degree 
            && degree.enable_sharing 
            && proposal.state === 'submitted' 
            && (user._id === proposal.user_id || user.admin)) {
                return <div className="dropdown">
                    <Button className="dropdown-toggle" data-toggle="dropdown">
                        Richiedi parere
                    </Button>
                    <div className="dropdown-menu p-3" style="min-width: 450px;">
                        <form>
                            <input name="email" placeholder="email"></input>
                            <input type="submit" value="richiedi parere"/>
                        </form>
                    </div>
                </div>
            }
        return null
    }

    function MessageCard() {
        return <Card className={
            {
                'draft': "border-left-primary",
                'submitted': "border-left-warning",
                'approved': "border-left-success",
                'rejected': "border-left-error",
            }[proposal.state]
        }>{
            {
                'draft': `Questo piano è in stato di bozza. Devi inviarlo per avere l'approvazione.`,
                'submitted': `Il piano è stato inviato in data ${proposal.date_submitted.format("D.M.Y")}. Riceverai un email quando verrà approvato o rifiutato`,
                'approved': `Il piano è stato approvato in data ${proposal.date_managed.format("D.M.Y")}.`,
                'rejected': `Il piano è stato rigettato in data ${proposal.date_managed.format("D.M.Y")}. Puoi farne una copia, modificarlo e inviarlo nuovamente.`,
            }[proposal.state]
        }</Card>
    }

    function DownloadButtons() {
        if (edit) return null
        return <>
            <a className="d-none d-md-inline" href="">
                <Button className="button-sm mr-2">
                    <i className="fas fa-file-pdf"></i> Scarica come PDF
                </Button>
            </a>
            <a className="d-none d-md-inline" href="">
                <Button className="button-sm">
                <i className="fas fa-file-pdf mr-2"></i>PDF inclusi i commenti
                </Button>
            </a>
            <div className="dropdown d-md-none">
                <Button className="btn-sm dropdown-toggle" data-toggle="dropdown">
                    <i className="fas fa-file-pdf"></i>
                </Button>
                <div className="dropdown-menu p-3">
                    <a className="dropdown-item" href="">
                        <i className="fas fa-file-pdf"></i> Scarica come PDF
                    </a>
                    <a className="dropdown-item" href="">
                        <i className="fas fa-file-pdf"></i> PDF inclusi i commenti
                    </a>
                </div>
            </div>
        </>
    }
    
    function Year({year}) {
        return <Card title={`${Curriculum.ordinal(year)} anno`}>
            <table className="table">
                <thead>
                <tr>
                    <th>Codice</th>
                    <th>Nome</th>
                    <th>Settore</th>
                    <th>Crediti</th>
                    <th>Gruppo</th>
                </tr>
                </thead>
                <tbody>
                { proposal.exams
                    .filter(e => e.year === year)
                    .map(e => <ExamRow key={e._id} exam={e}/>)
                }
                </tbody>
            </table>
        </Card>
    }

    function InfoCard() {
        if (edit) {
            if (degrees === null) return <Card><p>caricamento...</p></Card>
            return <Card>
            <div className="form-group" key="degree-selection">
                <select className="form-control" onChange={() => {}}
                    value={degree ? degrees.map((d) => d.id).indexOf(degree._id) : -1}>
                    <option key="degree-dummy" value="-1">
                        Selezionare il corso di Laurea
                    </option>
                    {degrees.map(degree => [
                        degree.academic_year, degree.name, 
                        <option key={degree._id} value={degree._id}>
                            {degree.name} &mdash; anno di immatricolazione {degree.academic_years()}
                        </option>]).sort().map(([a,b,rendering]) => rendering)}
                </select>
            </div>
        </Card>
        } else return <Card>
            <div className="d-flex mb-2">
                <AdminButtons />
                <ShareButton />
                <div className="flex-fill" />
                <DownloadButtons />
            </div>
            <table className="table"><tbody>
                <tr>
                    <th>Stato</th>
                    <td>{proposal.badge()}</td>
                </tr>
                <tr>
                    <th>Corso di Laurea</th>
                    <td>{proposal.degree_name}</td>
                </tr>
                <tr>
                    <th>Curriculum</th>
                    <td>{proposal.curriculum_name}</td>
                </tr>
                <tr>
                    <th>Anno di immatricolazione</th>
                    <td>{proposal.degree_academic_years()}</td>
                </tr>                
            </tbody></table>        
        </Card>
    }

    return <>
        <h1>Piano di studi di {proposal.user_name}</h1>
        <MessageCard />
        <InfoCard />
        { degree && [...Array(degree.years).keys()].map(year => <Year key={year} year={year+1}/>)}
        { JSON.stringify(proposal)}
    </>
}

