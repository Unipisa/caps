'use strict'

import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"
import api from '../modules/api'
import LoadingMessage from './LoadingMessage'
import Card from './Card'

export default function FormTemplate({ engine }) {
    const { id } = useParams()
    const [ formTemplate, setFormTemplate ] = useState(null)

    useEffect(async () => {
        try {
            const new_form_template = await api.get(`form_template/${id}`)
            setFormTemplate(new_form_template)
        } catch(err) {
            engine.flashCatch(err);
        }
    }, [ id ])

    if (degree === null) {
        return <LoadingMessage>caricamento modelli...</LoadingMessage>
    }

    return <>
        <h1>{ formTemplate.name }</h1>
        <Card>
            <div className="d-flex mb-2">
                <Link to="/form-templates">
                    <button type="button" className="btn btn-sm mr-2 btn-primary">
                        <i className="fas fa-arrow-left mr-2"></i>
                        Tutti i modelli
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
                    <tr>
                        <th>Nome</th>
                        <td>{ form_template.name }</td>
                    </tr>
                </thead>
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
                        <Group engine={ engine } key={ name } name={ name } exam_ids={ exams }/>)}
                </tbody>
            </table>
        </Card>
    </>
}

