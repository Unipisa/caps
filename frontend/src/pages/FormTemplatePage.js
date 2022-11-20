'use strict'

import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"

import { useEngine } from '../modules/engine'
import FormTemplate from '../models/FormTemplate'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'

export default function FormTemplatePage() {
    const engine = useEngine()
    const { id } = useParams()
    const [ formTemplate, setFormTemplate ] = useState(null)
    const query = engine.useGet(FormTemplate, id)

    if (formTemplate === null) {
        if (query.isSuccess) setFormTemplate(query.data)
        return <LoadingMessage>caricamento modello...</LoadingMessage>
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

            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <td>{ formTemplate.name }</td>
                    </tr>
                </thead>
                <tbody>
                <tr>
                    <th>Attivato</th>
                    <td>{ formTemplate.enabled?"attivo":"non attivo" }</td>
                </tr>
                <tr>
                    <th>Nome</th>
                    <td>{formTemplate.name}</td>
                </tr>
                <tr>
                    <th>Notifiche</th>
                    <td>{formTemplate.notify_emails.join(", ")}</td>
                </tr>
            </tbody></table>
        </Card>    
    </>
}

