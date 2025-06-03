import React, { useState } from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"

import { useGetExam, useGetCurriculum, useDeleteCurriculum } from '../modules/engine'
import Card from '../components/Card'
import LoadingMessage from '../components/LoadingMessage'
import { displayAcademicYears } from '../modules/utils'
import { useEngine } from '../modules/engine'

export default function CurriculumPage() {
    const { id } = useParams()
    const query = useGetCurriculum(id || '')
    const deleter = useDeleteCurriculum(id || '')
    const engine = useEngine()
    const navigate = useNavigate()
    
    const curriculum = query.data
    
    if (query.isError) return <div>errore caricamento curriculum</div>
    if (query.isLoading || !curriculum) return <LoadingMessage>caricamento curriculum...</LoadingMessage>
    
    const degree = curriculum.degree

    return <>
        <h1>{ curriculum.name }</h1>
        <Card>
            <div className="d-flex mb-2">
                <Link to="/degrees">
                    <button type="button" className="btn btn-sm mr-2 btn-primary">
                        <i className="fas fa-arrow-left mr-2"></i>
                        Tutti i curricula
                    </button>
                </Link>
                <a href={`/curricula/edit/${id}`}>
                    <button type="button" className="btn btn-sm mr-2 btn-primary">
                        Modifica
                    </button>
                </a>
                <a href="#" onClick={ () => deleteCurriculum() }>
                    <button type="button" className="btn btn-sm mr-2 btn-danger">Elimina</button>
                </a>

                <div className="flex-fill"></div>

                <div className="btn btn-sm btn-primary mr-2" >
                    <i className="fas fa-download mr-2"></i> Esporta in CSV
                </div>
            </div>
        </Card>
        <h3>{ degree?.name } { degree.academic_year ? displayAcademicYears(degree.academic_year) : '????-????'}</h3>
        { curriculum.years.map((year_section, year_count) =>
            <Card key={`year-${year_count}`} title={`${ordinal(year_count+1)} anno`}> 
                Crediti: { `${year_section.credits}` } <br />
                <table>
                    <tbody>
                    { year_section.exams.map((entry,i) => <ExamEntry key={i} entry={entry} />)}
                    </tbody>
                </table>
            </Card>
        )}
    </>

    function deleteCurriculum() {
        if (!confirm("Sei sicuro di voler cancellare questo curriculum?"))
            return false;

        debugger

        deleter.mutate(id, {
            onSuccess: () => {
                console.log("Curriculum cancellato con successo")
                engine.flashSuccess("Curriculum cancellato con successo")
                navigate('/curricula')
            },
            onError: (err) => {
                console.error("Errore durante la cancellazione del curriculum", err)
                engine.flashError(`${err}`)
            }
        })
    }


}


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

function ordinal(n) {
    const ordinals = [ "zero",
        "primo", "secondo", "terzo", "quarto", "quinto",
        "sesto", "settimo", "ottavo", "nono"]
    if (n < ordinals.length) return ordinals[n]
    else return `${ n+1 }-mo`
}
