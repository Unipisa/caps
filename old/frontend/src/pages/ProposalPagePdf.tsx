import React from 'react'
import { useParams } from "react-router-dom"

import { 
    useGetProposal, 
    useGetDegree, useGetCurriculum, useGetExam,
    useEngine, useIndex,
} from '../modules/engine'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import {formatDate,displayAcademicYears} from '../modules/utils'
import StateBadge from '../components/StateBadge'

export default function ProposalPagePdf() {
    const engine = useEngine()
    const user = engine.user
    const { id } = useParams()
    const proposalQuery = useGetProposal(id)
    const settingsQuery = useIndex(['settings'], {})
    const settings: any = settingsQuery.data
    const proposal = proposalQuery.data
    const curriculumQuery = useGetCurriculum(proposal?.curriculum_id)
    const curriculum = curriculumQuery.data
    const owner = (user && user?._id === proposal?.user_id)
    
    if (proposalQuery.isLoading || settingsQuery.isLoading || curriculumQuery.isLoading) {
        return <LoadingMessage>caricamento piano di studi...</LoadingMessage>
    }

    if (!proposal) return <div>Errore caricamento proposal</div>
    if (!settings) return <div>Errore caricamento settings</div>
    if (!curriculum) return <div>Errore caricamento curriculum</div>

    return <div id="content-wrapper" className="d-flex flex-column" style={{
        fontFamily: "Helvetica",
        fontSize: "0.7rem",
        margin: "0.8cm",
        marginBottom: "0.4cm",
    }}>
        <table>
            <tr>
                <td style={{width:"1%"}}><img src="/img/cherubino.png" width="100px"/></td>
                <TdHeading>
                    <H2>{settings.department}</H2>
                    <H2>{proposal.degree_name}</H2>
                    <H2>Anno Accademico {guessAcademicYears(proposal)}</H2>
                </TdHeading>
            </tr>
        </table>
        <div style={{paddingTop:"1ex", fontSize: "14pt"}}>
            <strong>Curriculum</strong>: {proposal.curriculum_name}<br />
            <strong>Anno di immatricolazione</strong>: {proposal.degree_academic_year}<br />
            <strong>Nome e cognome</strong>: {proposal.user_first_name} {proposal.user_last_name}<br />
            <strong>Matricola</strong>: {proposal.user_id_number}<br />
            <strong>Email</strong>: {proposal.user_email}<br />
        </div>
        {proposal && <MessageCard />}
        {proposal && <InfoCard />}
        { proposal?.exams?.map((year_exams, index) => <Year key={index} number={index} exams={year_exams}/>)}
    </div>

    function TdHeading({children}) {
        return <td style={{
            padding: "6px",
            paddingRight: "0.5cm",
            border: "none",
        }}>{children}</td>
    }

    function H2({children}) {
        return <h2 style={{
            fontSize: "15pt",
            fontWeight: "normal",
        }}>{children}</h2>
    }

    function guessAcademicYears(proposal) {
        let date = proposal?.date_managed || proposal?.date_submitted ||  proposal.date_modified
        if (!date) return "---"
        date = new Date(date)
        let year = date.getFullYear()
        const month = date.getMonth()
        if (month <= 8) year--
        return `${year}/${year+1}`
    }

    function MessageCard() {
        if (!proposal) return null
        return <Card className={
            {
                'draft': "border-left-primary",
                'submitted': "border-left-warning",
                'approved': "border-left-success",
                'rejected': "border-left-error",
            }[proposal.state]
        }>{
            {
                draft: `Questo piano è in stato di bozza. Devi inviarlo per avere l'approvazione.`,
                submitted: `Il piano è stato inviato in data ${formatDate(proposal.date_submitted)}. ${owner?'Riceverai un email quando verrà approvato o rifiutato.':''}`,
                approved: `Il piano è stato approvato in data ${formatDate(proposal.date_managed)}.`,
                rejected: `Il piano è stato rigettato in data ${formatDate(proposal.date_managed)}. Puoi farne una copia, modificarlo e inviarlo nuovamente.`,
            }[proposal.state]
        }</Card>
    }
    
    function ExamRow({ exam }) {
        const query = useGetExam(exam ? exam.exam_id : null)
        if (query.isLoading) return <tr><td>loading...</td></tr>
        if (query.isError) return <tr><td>error...</td></tr>
        const real_exam: any = query.data
        return <tr>
            <td>{exam?.exam_code || '---'}</td>
            <td>{exam?.exam_name || '---'}
                {real_exam && real_exam.tags.map(tag => 
                    <div key={tag} className="badge ml-1 badge-secondary badge-sm">
                        {tag}
                    </div>)}
            </td>
            <td>{exam?.exam_sector || '---'}</td>
            <td>{exam?.exam_credits || '---'}</td>
            <td>{exam ? {
                'CompulsoryExam': 'Obbligatorio',
                'CompulsoryGroup': exam.group,
                'FreeChoiceGroup': 'A scelta libera (G)',
                'FreeChoiceExam': 'A scelta libera',
                'ExternalExam': 'Esame Esterno',
            }[exam.__t] : '---'}
            </td>
        </tr>
    }

    function Year({number, exams}) {
        const yearName = ["Primo", "Secondo", "Terzo"][number] || `#${number}`

        return <Card title={`${yearName} anno`}>
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
                { exams.map((e,i) => <ExamRow key={`exam-${number}-${i}`} exam={e}/>) }
                </tbody>
            </table>
        </Card>
    }

    function InfoCard() {
        if (!proposal) return null
        return <Card>
            <div className="d-flex mb-2">
                <div className="flex-fill" />
            </div>
            <table className="table"><tbody>
                <tr>
                    <th>Stato</th>
                    <td><StateBadge state={proposal.state} /></td>
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
                    <td>{displayAcademicYears(proposal.degree_academic_year)}</td>
                </tr>                
            </tbody></table>        
        </Card>
    }
}

