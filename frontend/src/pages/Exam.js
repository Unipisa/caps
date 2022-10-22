'use strict';

import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"

import { useEngine } from '../modules/engine'
import api from '../modules/api'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'

export default function Exam() {
    const engine = useEngine()
    const { id } = useParams()
    const [ exam, setExam ] = useState(null)

    useEffect(async () => {
        try {
            const new_exam = await api.get(`exams/${id}`);
            setExam(new_exam);
        } catch(err) {
            engine.flashCatch(err);
        }
    }, [ id ])

    if (exam === null) {
        return <LoadingMessage>caricamento esame...</LoadingMessage>
    }

    return <>
        <h1>{ exam.name }</h1>
        <Card>
        <div className="d-flex mb-2">
        <Link to="/exams">
            <button type="button" className="btn btn-sm mr-2 btn-primary">
                <i className="fas fa-arrow-left mr-2"></i>
                Tutti gli esami
            </button>
        </Link>
        <a href="/exams/edit/130">
            <button type="button" className="btn btn-sm mr-2 btn-primary">Modifica</button>
        </a>
        <a href="/exams/delete/130" onClick={ () => confirm('Sei sicuro di voler cancellare questo esame?')}>
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
            <tr><th>Nome</th>
            <td>{ exam.name }</td>
            </tr></thead>
        
        <tbody><tr>
            <th>Codice</th>
            <td>{ exam.code }</td>
        </tr>
        <tr>
            <th>Settore</th>
            <td>{ exam.sector }</td>
        </tr>
        <tr>
            <th>Crediti</th>
            <td>{ exam.credits }</td>
        </tr>
        <tr>
            <th>Tags</th>
            <td>{ exam.tags }</td>
        </tr>
        <tr>
            <th>Note</th>
            <td>{ exam.notes }</td>
        </tr>
    </tbody></table>
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

