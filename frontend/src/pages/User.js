'use strict';

import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"

import { useEngine } from '../modules/engine'
import api from '../modules/api'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'

export default function User() {
    engine = useEngine()
    const { id } = useParams();
    const [ user, setUser ] = useState(null);

    useEffect(async () => {
        try {
            setUser(await api.get(`users/${id}`))
        } catch(err) {
            engine.flashCatch(err);
        }
    }, [ id ])

    if (user === null) {
        return <LoadingMessage>caricamento utente...</LoadingMessage>
    }

    return <>
        <Card>
        <h3>
            { user.first_name } <b>{ user.last_name }</b> 
            <span className="d-none d-md-inline h5 text-muted ml-2">
                matricola: { user.id_number }
            </span>
        </h3>
        </Card>
    </>
}

