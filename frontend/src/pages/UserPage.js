'use strict';

import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom"

import { useEngine } from '../modules/engine'
import api from '../modules/api'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import User from '../models/User'
import Proposal from '../models/Proposal'
import Comment from '../models/Comment'

import { ItemAddButton } from '../components/TableElements';

import CommentWidget from '../components/CommentWidget';

function CommentCard({comment}) {
    return <>
        <div className='mb-2 rounded border border-left-info p-1'>
            <div>{comment.content}</div>
            {comment.attachments.map(attachment => <div key={attachment._id}><a href={`/api/v0/attachments/${attachment._id}/content`}>{attachment.filename}</a></div>)}
            <div><strong>{comment.creator_id.name}</strong> - {(new Date(comment.createdAt)).toLocaleString()}</div>
        </div>
    </>
}

export default function UserPage() {
    const { id } = useParams()
    const [ user, setUser ] = useState(null)
    const [ proposals, setProposals ] = useState(null)
    const [ comments, setComments ] = useState(null)
    const engine = useEngine()
    const userQuery = engine.useGet(User, id)
    const proposalsQuery = engine.useIndex(Proposal, { user_id: id })
    const commentsQuery = engine.useIndex(Comment, { creator_id: id })

    if (user === null) {
        if (userQuery.isSuccess) setUser(userQuery.data)
        return <LoadingMessage>caricamento utente...</LoadingMessage>
    }
    if (proposals === null) {
        if (proposalsQuery.isSuccess) setProposals(proposalsQuery.data)
        return <LoadingMessage>caricamento piani di studio...</LoadingMessage>
    }
    if (comments === null) {
        if (commentsQuery.isSuccess) setComments(commentsQuery.data)
        return <LoadingMessage>caricamento commenti e allegati...</LoadingMessage>
    }
    if (comments != commentsQuery.data) {
        setComments(commentsQuery.data)
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

        <h2 className='d-flex mt-4'>
            <span className='mr-auto'>Piano di studi</span>
            <ItemAddButton to="/proposals/new">Nuovo piano di studi</ItemAddButton>
        </h2>
        {
            proposals.length == 0
            ? <div>Nessun piano di studi presentato.</div>
            : proposals.items.map(proposal => 
                <div key={proposal._id}>{proposal.degree_name}</div>
            )
        }

        <h2 className='mt-4'>Documenti e allegati</h2>
        <Card>
            <p>I documenti e le annotazioni inserite in questa sezione sono associate allo studente, ma visibili solo per gli amministratori.</p>
            {
                comments.items.length === 0 ?
                <p>Nessun documento allegato.</p> :
                comments.items.map(comment => <CommentCard key={comment._id} comment={comment} />)
            }
            <CommentWidget />
            
            {/*<button type="button" className="btn btn-sm btn-primary dropdown-toggle" id="dropDownActions"
                        data-toggle="collapse" target="#collapse-7">
                Inserisci un nuovo allegato
            </button>*/}
        </Card>
    </>
}

