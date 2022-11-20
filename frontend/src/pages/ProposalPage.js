'use strict'

import React, { useState } from 'react'
import { useParams } from "react-router-dom"

import { useEngine } from '../modules/engine'
import Proposal from '../models/Proposal'
import Curriculum from '../models/Curriculum'
import Degree from '../models/Degree'
import Exam from '../models/Exam'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import {Button} from 'react-bootstrap' 

function ExamRow({exam}) {
    const engine = useEngine()
    const query = engine.useGet(Exam, exam.exam_id)
    const real_exam = query.isSuccess ? query.data : null
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


export default function ProposalPage() {
    const engine = useEngine()
    const { id } = useParams()
    console.log(`ProposalPage id=${id || null}`)
    const empty = {
        curriculum_id: null,
        user_name: engine.user.name,
        state: 'draft',
    }
    const edit = false
    const query = engine.useGet(Proposal, id || null)
    const proposal = id ? ( query.isSuccess ? new Proposal(query.data) : null ) : empty
    const curriculumQuery = engine.useGet(Curriculum, (proposal && proposal.curriculum_id) ? proposal.curriculum_id : null)
    const curriculum = curriculumQuery.isSuccess ? new Curriculum(curriculumQuery.data) : null
    const degreeQuery = engine.useGet(Degree, curriculum ? curriculum.degree_id : null)
    const degree = degreeQuery.isSuccess ? new Degree(degreeQuery.data) : null

    console.log(`proposal: ${JSON.stringify(proposal)}`)
    console.log(`curriculum: ${JSON.stringify(curriculum)}`)
    console.log(`degree: ${JSON.stringify(degree)}`)

    if (proposal === null || (proposal.curriculum_id && (curriculum === null || degree === null))) {
        return <LoadingMessage>caricamento piano di studi...</LoadingMessage>
    }

    function AdminButtons() {
        if (engine.user.admin && proposal.state === 'submitted') return <>
            <Button>accetta</Button>
            <Button>rifiuta</Button>
        </>       
        return null
    }

    function ShareButton() {
        if (degree 
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

    return <>
        <h1>Piano di studi di {proposal.user_name}</h1>
        <MessageCard />
        <Card>
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
        { [...Array(degree.years).keys()].map(year => <Year key={year} year={year+1}/>)}
        { JSON.stringify(proposal)}
    </>
}

