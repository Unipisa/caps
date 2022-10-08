'use strict';

import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"

import api from '../modules/api'

import Card from '../components/Card'
import LoadingMessage from '../components/LoadingMessage'

const roman = n => {
    const ordinals = [
        "primo", "secondo", "terzo", "quarto", "quinto",
        "sesto", "settimo", "ottavo", "nono"]
    if (n < ordinals.length) return ordinals[n]
    else return `${ n+1 }-mo`
}

function CompulsoryExam({ engine, exam_id }) {
    const [ exam, setExam ] = useState(null)

    useEffect(() => (async () => {
        try {
            const new_exam = await api.get(`exams/${exam_id}`)
            console.log(`new exam: ${JSON.stringify(new_exam)}`)
            setExam(new_exam)
        } catch(err) {
            engine.flashCatch(err)
        }
    })(),[engine, exam_id])

    if (exam === null) return <tr><td>...</td><td></td></tr>
    return <tr><th>esame obbligatorio</th><td>{ exam.name }</td><td>{ exam.cfu }</td></tr>
}

function ExamEntry({ engine, entry }) {
    if (entry.__t === "CompulsoryExam") return <CompulsoryExam engine={engine} exam_id={entry.exam_id} />
    else return <tr><td>???</td></tr>
}

export default function Curriculum({ engine }) {
    const { id } = useParams();
    const [ curriculum, setCurriculum ] = useState(null);

    useEffect(async () => {
        try {
            const new_curriculum = await api.get(`curricula/${id}`);
            setCurriculum(new_curriculum);
        } catch(err) {
            engine.flashCatch(err);
        }
    }, [ id ])

    if (curriculum === null) {
        return <LoadingMessage>caricamento curriculum...</LoadingMessage>
    }

    console.log(`curriculum: ${JSON.stringify(curriculum)}`)

    return <>
        <h1>{ curriculum.name }</h1>
        { curriculum.years.map((year_section, year_count) =>
            <Card key={`year-${year_count}`} title={`${roman(year_count)} anno`}>
                Crediti: { year_section.credits } <br />
                <table>
                    <tbody>
                    { year_section.exams.map(entry => <ExamEntry key={entry._id} entry={entry} engine={engine} />)}
                    </tbody>
                </table>
            </Card>
        )}
    </>
}

