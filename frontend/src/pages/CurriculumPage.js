'use strict';

import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"

import { useEngine } from '../modules/engine'
import api from '../modules/api'
import Curriculum from '../models/Curriculum'
import Card from '../components/Card'
import LoadingMessage from '../components/LoadingMessage'
import Exam from '../models/Exam';

function CompulsoryExam({ exam_id }) {
    const engine = useEngine()
    const query = engine.useGet(Exam, exam_id);

    if (query.isSuccess) {
        const exam = query.data;
        return <tr>
            <th>esame obbligatorio</th>
            <td>{ exam.name }</td>
            <td>{ exam.credits }</td>
            <td>{ exam.code }</td>
            <td>{ exam.sector }</td>
        </tr>
    } else {
        return <tr>
            <td>...</td>
            <td></td>
        </tr>
    }
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
    const engine = useEngine()
    const { id } = useParams()
    const [ curriculum, setCurriculum ] = useState(null)
    const query = engine.useGet(Curriculum, id)

    if (curriculum === null) {
        if (query.isSuccess) setCurriculum(query.data)
        return <LoadingMessage>caricamento curriculum...</LoadingMessage>
    }

    console.log(`curriculum: ${JSON.stringify(curriculum)}`)

    return <>
        <h1>{ curriculum.name }</h1>
        { curriculum.years.map((year_section, year_count) =>
            <Card key={`year-${year_count}`} title={`${Curriculum.ordinal(year_count+1)} anno`}> 
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

