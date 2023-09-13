'use strict';

import React from 'react'
import { Link, useParams } from "react-router-dom"

import { useEngine, useGet, useIndex, useDelete } from '../modules/engine'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import User from '../models/User'
import Proposal from '../models/Proposal'
import { ItemAddButton } from '../components/TableElements'
import Comments from '../components/Comments'

export default function UserPage() {
    const { id } = useParams()
    const engine = useEngine()
    const userQuery = useGet(User, id)

    if (userQuery.isLoading) return <LoadingMessage>caricamento utente...</LoadingMessage>
    if (userQuery.isError) return <div>errore caricamento utente</div>

    const user = userQuery.data

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
            <span className='mr-auto'>Piani di studio</span>
            <ItemAddButton to="/proposals/new">Nuovo piano di studi</ItemAddButton>
        </h2>
        <Proposals id={id} />

        {
            engine.user.admin && <>
                <h2 className='mt-4'>Documenti e allegati</h2>
                <Card>
                    <p>I documenti e le annotazioni inserite in questa sezione sono associate allo studente, ma visibili solo per gli amministratori.</p>
                    <Comments object_id={id} />
                </Card>
            </>
        }
    </>
}

function Proposals({id}) {
    const proposalsQuery = useIndex(Proposal, { user_id: id })
    if (proposalsQuery.isLoading) return <LoadingMessage>caricamento piani di studio...</LoadingMessage>
    if (proposalsQuery.isError) return <div>errore caricamento piani di studio</div> 

    const proposals = proposalsQuery.data.items

    return <div className='row'>
        { 
            proposals.length == 0 && 
            <div>
                Nessun piano di studi presentato.            
            </div>
        }
        {
            proposals.map(proposal => 
                <ProposalCard key={proposal._id} proposal={proposal} />
            )
        }
    </div>
}

function ProposalCard({proposal}) {
    const engine = useEngine()
    const deleter = useDelete(Proposal, proposal._id)

    async function deleteProposal() {
        engine.modalConfirm("Elimina piano di studi", "confermi di voler eliminare il piano di studi?")
            .then(confirm => {
                if (confirm) {
                    deleter.mutate(null, {
                        onSuccess: () => {
                            engine.flashSuccess("Piano di studi cancellato con successo")
                            // si può anche rimuovere il flashSuccess perché il
                            // fatto che l'operazione sia andata a buon fine è evidente
                            // dalla scomparsa del piano di studi dalla lista
                        },
                        onError: (err) => {
                            engine.flashError("Errore cancellazione piano di studi")
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

