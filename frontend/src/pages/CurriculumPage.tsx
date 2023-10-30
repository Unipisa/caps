import React from 'react'
import { useParams } from "react-router-dom"

import { useGetExam, useGetCurriculum } from '../modules/engine'
import Card from '../components/Card'
import LoadingMessage from '../components/LoadingMessage'
import { displayAcademicYears } from '../modules/utils'

const degree_path = "/degrees/"

function CompulsoryExam({ exam_id }) {
    const query = useGetExam(exam_id);

    if (query.isError) return <tr>
        <th>esame obbligatorio</th>
        <td>???</td>
    </tr>
    
    const exam = query.data;

    if (!exam) return <tr>
        <th>esame obbligatorio</th>
        <td>...</td>
    </tr>



    return <tr>
        <th>esame obbligatorio</th>
        <td>{ exam.name }</td>
        <td>{ exam.credits }</td>
        <td>{ exam.code }</td>
        <td>{ exam.sector }</td>
    </tr>
}

function CompulsoryGroup({ group }) {
    return <tr><th>esame a scelta in un gruppo</th><td>{ group }</td></tr>
}

function ExamEntry({ entry }) {
    if (entry.__t === "CompulsoryExam") return <CompulsoryExam exam_id={entry.exam_id} />
    if (entry.__t === "CompulsoryGroup") return <CompulsoryGroup group={entry.group} />
    if (entry.__t === "FreeChoiceExam") return <tr><th>esame a scelta libera</th></tr>
    else return <tr><td>???</td></tr>
}

export default function CurriculumPage() {
    const { id } = useParams()
    const query = useGetCurriculum(id || '')
    const curriculum = query.data
    
    if (query.isError) return <div>errore caricamento curriculum</div>
    if (!curriculum) return <LoadingMessage>caricamento curriculum...</LoadingMessage>
    
    const degree = curriculum.degree

    console.log(`curriculum: ${JSON.stringify(curriculum)}`)

    return <>
        <h1>{ curriculum.name }</h1>
        <h3>{ degree?.name } { degree.academic_year ? displayAcademicYears(degree.academic_year) : '????-????'}</h3>
        { curriculum.years.map((year_section, year_count) =>
            <Card key={`year-${year_count}`} title={`${ordinal(year_count+1)} anno`}> 
                Crediti: { `${year_section.credits}` } <br />
                <table>
                    <tbody>
                    { year_section.exams.map(entry => <ExamEntry key={entry._id} entry={entry} />)}
                    </tbody>
                </table>
            </Card>
        )}
    </>
}

function ordinal(n) {
    const ordinals = [ "zero",
        "primo", "secondo", "terzo", "quarto", "quinto",
        "sesto", "settimo", "ottavo", "nono"]
    if (n < ordinals.length) return ordinals[n]
    else return `${ n+1 }-mo`
}
