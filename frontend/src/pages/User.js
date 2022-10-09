'use strict';

import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"

import api from '../modules/api'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'

export default function User({engine}) {
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
            { user.givenname } { user.surname } 
            <span class="d-none d-md-inline h5 text-muted ml-2">
                matricola: { user.number }
            </span>
        </h3>
        </Card>
    </>
}

