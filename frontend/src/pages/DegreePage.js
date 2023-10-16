'use strict';

import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"

import { useEngine, useGet, useIndex } from '../modules/engine'
import Degree from '../models/Degree'
import Card from '../components/Card'
import LoadingMessage from '../components/LoadingMessage'

function Group({ name, exam_ids }) {
    const engine = useEngine()
    const query = useIndex(Exam, {'ids': exam_ids.join(",")})

    if (query.isLoading) return <tr>
        <th>{ name }</th>
        <td> ...loading... </td>
    </tr>
    if (query.isError) return <tr>
        <th>{ name }</th>
        <td> ...error... </td>
    </tr>

    const exams = query.data

    return <tr>
        <th>{ name }</th>
        <td>{  exams.items.map(e => e.name).join(", ") }</td>
    </tr>
}

export default function DegreePage() {
    const { id } = useParams();
    const query = useGet(Degree, id)

    if (query.isLoading) return <LoadingMessage>caricamento corso di studi...</LoadingMessage>
    if (query.isError) return <div>errore caricamento corso di studi</div>

    const degree = query.data

    return <>
        <h1>{ degree.name }</h1>
        <Card>
            <div className="d-flex mb-2">
                <Link to="/degrees">
                    <button type="button" className="btn btn-sm mr-2 btn-primary">
                        <i className="fas fa-arrow-left mr-2"></i>
                        Tutti i corsi di studi
                    </button>
                </Link>
                <a href="#">
                    <button type="button" className="btn btn-sm mr-2 btn-primary">Modifica</button>
                </a>
                <a href="#" onClick={ () => confirm('Sei sicuro di voler cancellare questo esame?')}>
                    <button type="button" className="btn btn-sm mr-2 btn-danger">Elimina</button>
                </a>

                <div className="flex-fill"></div>

                <div className="btn btn-sm btn-primary mr-2" type="button" >
                    <i className="fas fa-download mr-2"></i> Esporta in CSV
                </div>
            </div>
            <table className="table">
                <thead>
                    <tr><th>Nome</th>
                    <td>{ degree.name }</td>
                    </tr></thead>
                <tbody>
                <tr>
                    <th>Anno accademico</th>
                    <td>{ degree.academic_year }/{ degree.academic_year + 1 }</td>
                </tr>
                <tr>
                    <th>Durata anni</th>
                    <td>{ degree.years }</td>
                </tr>
                <tr>
                    <th>Attivato</th>
                    <td>{ degree.enabled ? "attivo" : "non attivo"}</td>
                </tr>
                <tr>
                    <th>Richiesta parere</th>
                    <td>{ degree.sharing_enabled ? "attiva" : "non attiva" }</td>
                </tr>
                <tr>
                    <th>Gruppo esami per la scelta libera</th>
                    <td> { degree.default_group || "tutti gli esami" } </td>
                </tr>
                <tr>
                    <th></th>
                    <td></td>
                </tr>
            </tbody></table>
        </Card>    

        <Card title="messaggi">
            <p>
            Questi messaggi vengono mostrati allo studente che visualizza il piano.
            Possono essere personalizzati per indicare le procedure da seguire nei vari casi. 
            </p>
            <table className="table">
                <tbody>
                    <tr>
                        <th>Messaggio invio</th>
                        <td dangerouslySetInnerHTML={{__html: degree.submission_message}} />
                    </tr>
                    <tr>
                        <th>Messaggio approvazione</th>
                        <td dangerouslySetInnerHTML={{__html: degree.approval_message}} />
                    </tr>
                    <tr>
                        <th>Messaggio rifiuto</th>
                        <td dangerouslySetInnerHTML={{__html: degree.rejection_message}} />
                    </tr>
                </tbody>
            </table>
        </Card>

        <Card title="Email">
            <p>
                L'approvazione, invio, e rifiuto di un piano di studi possono essere comuncati 
                via e-mail allo studente e agli indirizzi specificati nelle 
                <a href="/settings">impostazioni</a>.
                Questo avviene 
                solo per gli eventi selezionati qui. 
            </p>
            <table className="table">
                <tbody>
                    <tr>
                        <th>Invio</th>
                        <td>Email { degree.submission_confirmation ? "abilitata" : "disabilitata"}</td>
                    </tr>
                    <tr>
                        <th>Approvazione</th>
                        <td>Email { degree.approval_confirmation ? "abilitata" : "disabilitata"}</td>
                    </tr>
                    <tr>
                        <th>Rifiuto</th>
                        <td>Email { degree.rejection_confirmation ? "abilitata" : "disabilitata"}</td>
                    </tr>
                </tbody>
            </table>
        </Card>

        <Card title="Gruppi di esami">
            <table className="table">
                <tbody>
                    { Object.entries(degree.groups).map(([name, exams]) => 
                        <Group key={ name } name={ name } exam_ids={ exams }/>)}
                </tbody>
            </table>
        </Card>
    </>
}

