'use strict'

import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"

import api from '../modules/api'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'

export default function Proposal({ engine }) {
    const { id } = useParams()
    const [ proposal, setProposal ] = useState(null)
    const edit = false

    useEffect(() => (async () => {
        try {
            const got_proposal = await api.get(`proposals/${id}`)
            setProposal(got_proposal)
        } catch(err) {
            engine.flashCatch(err);
        }
    })(), [ setProposal, engine ])

    if (proposal === null) {
        return <LoadingMessage>caricamento piano di studi...</LoadingMessage>
    }
    
    return <Card title={`Piano di studi di dd${proposal.user_name}`}>
        ...
    </Card>;
}

