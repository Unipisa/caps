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

function ProposalCard({proposal}) {
    const engine = useEngine()
    const deleter = engine.useDelete(Proposal, proposal._id)

    async function deleteProposal() {
        engine.modalConfirm("Elimina piano di studi", "confermi di voler eliminare il piano di studi?")
            .then(confirm => {
                if (confirm) {
                    deleter.mutate(null, {
                        onSuccess: () => {
                            engine.flashSuccess("Piano di studi cancellato con successo")
                            // TODO controlla (dopo aver aggiunto le opportune route in
                            // backend) che questa cosa effettivamente invalidi la
                            // query e la pagina si aggiorni con i piani di studi senza
                            // quello rimosso
                            //
                            // Nel caso, si può anche rimuovere il flashSuccess perché il
                            // fatto che l'operazione sia andata a buon fine è evidente
                            // dalla scomparsa del piano di studi dalla lista
                        }
                    })
                }
            })
    }

    const [state, stateClass] = {
        draft: ["Bozza", "secondary"],
        submitted: ["Inviato", "warning"],
        approved: ["Approvato", "success"],
        rejected: ["Rifiutato", "danger"]
    }[proposal.state]

    return <div className='my-2 col-xxl-3 col-xl-4 col-lg-6 col-12'>
        <Card title={proposal.degree_name} className="clickable-card">
            <div className='d-flex justify-content-between'>
                <div>
                    <span className={`badge badge-${stateClass}`}>{state}</span>
                </div>
                <div className='btn-group'>
                    {
                        proposal.state === "draft"
                        ? (
                            <>
                                <Link className='btn btn-primary' to={`/proposal/edit/${proposal._id}`}><i className='fas fa-edit' /></Link>
                                <div className='btn btn-danger' onClick={deleteProposal}>
                                    <i className='fas fa-times-circle'/>
                                </div>
                            </>
                        )
                        : (
                            <Link className='btn btn-primary' to={`/proposal/duplicate/${proposal._id}`}><i className='fas fa-copy' /></Link>
                        )
                    }
                </div>
            </div>
            <div className='font-weight-bold'>Curriculum: {proposal.curriculum_name}</div>
            <div className='small text-muted'>Regolamento dell'anno accademico {proposal.degree_academic_year}/{proposal.degree_academic_year + 1}</div>
            <div className='small text-muted'>Ultima modifica: {(new Date(proposal.date_modified)).toLocaleString()}</div>
        </Card>
    </div>
}

function CommentCard({comment}) {
    const engine = useEngine()
    const deleter = engine.useDelete(Comment, comment._id)

    function deleteComment() {
        engine.modalConfirm("Elimina commento", "confermi di voler eliminare il commento?")
            .then(confirm => {
                if (confirm) {
                    deleter.mutate(null, {})
                }
            })
        
    }
    return <>
        <div className='mb-2 rounded border border-left-info p-1 d-flex justify-content-between align-items-end'>
            <div>
                <div>{comment.content}</div>
                {comment.attachments.map(attachment => <div key={attachment._id}><a href={`/api/v0/attachments/${attachment._id}/content`}>{attachment.filename}</a></div>)}
                <div><strong>{comment.creator_id.name}</strong> - {(new Date(comment.createdAt)).toLocaleString()}</div>
            </div>
            <div className='btn btn-sm btn-danger' onClick={deleteComment}>Elimina</div>
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

    if (user !== userQuery.data) {
        if (userQuery.isSuccess) setUser(userQuery.data)
        return <LoadingMessage>caricamento utente...</LoadingMessage>
    }
    if (proposals !== proposalsQuery.data) {
        if (proposalsQuery.isSuccess) setProposals(proposalsQuery.data)
    }
    if (comments !== commentsQuery.data) {
        if (commentsQuery.isSuccess) setComments(commentsQuery.data)
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
        <div className='row'>
        {
            proposalsQuery.isSuccess && proposals === proposalsQuery.data
                ? (
                    proposals.length == 0
                        ? <div>Nessun piano di studi presentato.</div>
                        : proposals.items.map(proposal => <ProposalCard key={proposal._id} proposal={proposal} />)
                )
                : <LoadingMessage>caricamento piani di studio...</LoadingMessage>
        }
        </div>

        {
            engine.user.admin && <>
                <h2 className='mt-4'>Documenti e allegati</h2>
                <Card>
                    <p>I documenti e le annotazioni inserite in questa sezione sono associate allo studente, ma visibili solo per gli amministratori.</p>
                    {
                        commentsQuery.isSuccess && comments === commentsQuery.data
                            ? (
                                comments.items.length === 0
                                    ? <p>Nessun documento allegato.</p>
                                    : comments.items.map(comment => <CommentCard key={comment._id} comment={comment} />)
                            )
                            : <LoadingMessage>caricamento commenti e allegati...</LoadingMessage>
                    }
                    <CommentWidget />
                </Card>
            </>
        }
    </>
}

