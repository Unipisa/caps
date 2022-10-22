'use strict'

import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"

import { useEngine } from '../modules/engine'
import api from '../modules/api'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'

export default function Proposal() {
    const { id } = useParams()
    const [ proposal, setProposal ] = useState(null)
    const edit = false
    const engine = useEngine()
    const query = engine.useGet('proposals', id)

    if (proposal === null) {
        if (query.isSuccess) setProposal(query.data)
        return <LoadingMessage>caricamento piano di studi...</LoadingMessage>
    }
    
    return <Card title={`Piano di studi di ${proposal.user_name}`}>
        ...
    </Card>;
}

