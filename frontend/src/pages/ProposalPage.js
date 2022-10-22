'use strict'

import React, { useState } from 'react'
import { useParams } from "react-router-dom"

import { useEngine } from '../modules/engine'
import Proposal from '../models/Proposal'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'

export default function ProposalPage() {
    const { id } = useParams()
    const [ proposal, setProposal ] = useState(null)
    const edit = false
    const engine = useEngine()
    const query = engine.useGet(Proposal, id)

    if (proposal === null) {
        if (query.isSuccess) setProposal(query.data)
        return <LoadingMessage>caricamento piano di studi...</LoadingMessage>
    }
    
    return <Card title={`Piano di studi di ${proposal.user_name}`}>
        ...
    </Card>;
}

