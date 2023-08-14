'use strict'

import React, { useState } from "react";

import { useEngine } from "../modules/engine";

import Attachment from "../models/Attachment";

import { default as BootStrapCard } from 'react-bootstrap/Card';

/**
* Widget to upload comments and attachments
    *  
    * Possible props:
    * - afterCommentPost(id), a function that gets called after a succesful
    *   post of the comment (via the "Send" button inside the widget), that
    *   takes the id of the newly posted comment as the only argument
*/
export default function CommentWidget({ afterCommentPost }) {
    const engine = useEngine()
    const attachmentInserter = engine.useMultipartInsert(Attachment)
    const [files, setFiles] = useState([])
    const [error, setError] = useState({})

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
            const file = document.getElementById(`allegato-${id}`).files[0]
            if (file !== undefined) data.append(`allegato-${id}`, file, file.name)
        }
        data.append('uploader_id', engine.user.id)

        attachmentInserter.mutate(
            data,
            {
                onSuccess: (attachmentIds) => {
                    engine.flashSuccess("Allegati aggiunti con successo")

                    // TODO: fai insert del commento oltre che degli allegati
                },
                onError: (err) => {
                    if (err.code === 403) {
                        setError(err.issues)
                    }
                }
            }
        )
    }

    return <BootStrapCard className="shadow my-2">
        {
            <BootStrapCard.Header className="bg-primary">
                <h5 className="text-white">
                    Aggiungi allegato o commento
                </h5>
            </BootStrapCard.Header>
        }
        <BootStrapCard.Body>
            <div className="d-flex flex-column">
                <textarea className="mb-3" />
                <div className="d-flex flex-column">
                    {
                        files.map(e => {
                            return <div key={e} className={`d-flex justify-content-between mb-2 ${error.location === `allegato-${e}` ? "pl-2 border-left-danger" : ""}`}>
                                <input id={`allegato-${e}`} type="file" onChange={() => setError({})}/>
                                <span role="button" onClick={() => deleteFile(e)}>
                                    <i className="fas fa-times"></i>
                                </span>
                            </div>
                        })
                    }
                </div>
                {error &&
                    <div className="text-danger">{error.message}</div>
                }        
                <div className="d-flex justify-content-between">
                    <button className="btn btn-primary" onClick={addFile}>
                        <i className="fas fa-plus"></i>
                        <span className="ml-2">Aggiungi file</span>
                    </button>
                    <button className="btn btn-primary" onClick={send}>Invia</button>
                </div>
            </div>
        </BootStrapCard.Body>
    </BootStrapCard>;
}
