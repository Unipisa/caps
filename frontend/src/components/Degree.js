'use strict';

import React, { useEffect, useState } from 'react';
import { Link, useParams } from "react-router-dom";
import api from '../modules/api';
import LoadingMessage from './LoadingMessage';
import Card from './Card';
import { PageContext } from './SinglePage';

export default function Degree() {
    return <PageContext.Consumer>
        { ({ flashCatch }) => <DegreeWithContext flashCatch={ flashCatch } /> }
    </PageContext.Consumer>
}

function DegreeWithContext({ flashCatch }) {
    const { id } = useParams();
    const [ degree, setDegree ] = useState(null);

    useEffect(async () => {
        try {
            const new_degree = await api.get(`degrees/${id}`);
            setDegree(new_degree);
        } catch(err) {
            flashCatch(err);
        }
    }, [ id ])

    if (degree === null) {
        return <LoadingMessage>caricamento corso di studi...</LoadingMessage>
    }

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
        <tbody><tr></tr></tbody>
        <thead>
            <tr><th>Nome</th>
            <td>{ degree.name }</td>
            </tr></thead>
        
        <tbody><tr>
            <th>Codice</th>
            <td>{ exam.code }</td>
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
    <tbody><tr>
        </tr></tbody><thead>
            <tr><th>Piani approvati</th>
            <th>Anno accademico</th>
            <th>Curriculum</th>
            <th>Laurea</th>
        </tr></thead>
    
        <tbody><tr>
            <td>xyz</td>
            <td>yyyy/yyyy</td>
            <td>Bla bla</td>
            <td>Bla Bla bla</td>
        </tr>
        </tbody></table>
    </Card>
    </>
}

