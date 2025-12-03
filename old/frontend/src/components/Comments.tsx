import React, { useState } from 'react'

import { useEngine, useIndex, useDelete, usePost } from "../modules/engine"
import Card from "./Card";
import LoadingMessage from '../components/LoadingMessage'
import Form from 'react-bootstrap/Form'

export default function Comments({object_id}) {
    const commentsQuery = useIndex(['comments'], { object_id })

    if (commentsQuery.isError) return <div>errore caricamento commenti</div>    
    if (commentsQuery.data === undefined) return <LoadingMessage>caricamento commenti...</LoadingMessage>

    const comments = commentsQuery.data.items

    return <>
        {
            comments.length === 0
                ? <p>Nessun commento.</p>
                : comments.map(comment => 
                    <CommentCard key={comment._id} comment={comment} />)
        }
        <CommentWidget object_id={object_id} />
    </>
}

function CommentCard({ comment, userUpdater }: 
    { 
        comment: any, 
        userUpdater?: (user: Comment) => void 
    }) {
    const engine = useEngine()
    const deleter = useDelete(['comments'], comment._id)

    if (!engine) return null

    return <>
        <div className='mb-2 rounded border border-left-info p-1 d-flex justify-content-between align-items-end'>
            <div>
                <div>{comment.content}</div>
                {comment.attachmentsData.map(attachment => <div key={attachment._id}>
                    <a href={`/api/v0/attachments/${attachment.signedId}/content`}>{attachment.filename}</a></div>)}
                <div><strong>{comment.creator_id.name}</strong> - {(new Date(comment.createdAt)).toLocaleString()}</div>
            </div>
            <div className='btn btn-sm btn-danger' onClick={deleteComment}>Elimina</div>
        </div>
    </>

    function deleteComment() {
        engine?.modalConfirm("Elimina commento", "confermi di voler eliminare il commento?")
            .then(confirm => {
                if (confirm) {
                    deleter.mutate()
                }
            })
        
    }    
}

/**
    * Widget to upload comments and attachments
        *  
        * Possible props:
        * - afterCommentPost(id), a function that gets called after a succesful
        *   post of the comment (via the "Send" button inside the widget), that
        *   takes the id of the newly posted comment as the only argument
*/
function CommentWidget({object_id}) {
    const engine = useEngine()
    const attachmentInserter = usePost(['attachments'])
    const commentInserter = usePost(['comments'])
    const [text, setText] = useState("")
    const [files, setFiles] = useState<number[]>([])
    const [error, setError] = useState<any>({})

    function addFile() {
        setError({})
        let newId = 0
        while (files.includes(newId)) {
            newId = newId + 1
        }
        setFiles(files.concat([newId]))
    }

    function deleteFile(id) {
        setError({})
        setFiles(files.filter(e => e !== id))
    }

    async function send() {
        setError({})
        const data = new FormData();
        for (const id of files) {
            // TODO: vedi se c'è un modo migliore di recuperare l'input che non
            // sia tramite document.getElementById
            const el = document.getElementById(`allegato-${id}`) as HTMLInputElement
            if (!el) continue
            if (!el.files) continue   
            const file = el.files[0]
            if (file !== undefined) data.append(`allegato-${id}`, file, file.name)
        }

        attachmentInserter.mutate(data as any, {
            onSuccess: (res) => {
                const attachmentIds = res.data
                const comment = {
                    object_id,
                    content: text,
                    attachments: attachmentIds
                }
                commentInserter.mutate(comment as any, {
                    onSuccess: (commentId) => {
                        setText("")
                        setFiles([])
                        setError({})
                    },
                    onError: (err) => {
                        engine?.flashError(`${err}`)
                    }
                })
            },
            onError: (err:any) => {
                if (err?.code === 422) {
                    setError(err)
                } else {
                    engine?.flashError(`${err}`)
                }
            }
        })
    }
    
    return <Card title="Aggiungi allegato o commento">
        <div className="d-flex flex-column">
            <Form.Control as="textarea" className="mb-3" value={text} onChange={e => setText(e.target.value)}/>
            <div className="d-flex flex-column">
                {
                    files.map(id => {
                        return <div key={id} className={`d-flex justify-content-between mb-2 ${error.issues === `allegato-${id}` ? "pl-2 border-left-danger" : ""}`}>
                            <input id={`allegato-${id}`} type="file" onChange={() => setError({})}/>
                            <span role="button" onClick={() => deleteFile(id)}>
                                <i className="fas fa-times"></i>
                            </span>
                        </div>
                    })
                }
            </div>
            {error &&
                <div className="text-danger">{error?.message}</div>
            }        
            <div className="d-flex justify-content-between">
                <button className="btn btn-primary" onClick={addFile}>
                    <i className="fas fa-plus"></i>
                    <span className="ml-2">Aggiungi file</span>
                </button>
                <button className="btn btn-primary" onClick={send}>Invia</button>
            </div>
        </div>
    </Card>;
}
