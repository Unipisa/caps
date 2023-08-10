'use strict'

import React, { useState } from "react";

import { useEngine } from "../modules/engine";

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
    // const inserter = engine.useInsert(Comment)
    const [status, setStatus] = useState("input")
    const [files, setFiles] = useState([])

    function addFile() {
        let newId = 0
        while (files.includes(newId)) {
            newId = newId + 1
        }
        setFiles(files.concat([newId]))
    }
    function deleteFile(id) {
        setFiles(files.filter(e => e !== id))
    }

    async function send() {
        setStatus("uploading")
        const data = new FormData();
        for(const id of files) {
            // TODO: vedi se c'è un modo migliore di recuperare l'input che non
            // sia tramite document.getElementById
            const file = document.getElementById(`file-input-${id}`).files[0]
            if (file !== undefined) data.append('allegati', file, file.name)
        }

        // Soluzione temporanea per testare: non verrà utilizzato "fetch"
        // così in questo modo nella soluzione finale, probabilmente verrà
        // messo un metodo apposito in engine (se non sarà possibile
        // utilizzare il già esistente post, ma forse è possibile usare post)
        fetch('/api/v0/attachments', {
            method: 'POST',
            body: data,
        })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((err) => console.error(err));
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
                            return <div key={e} className="d-flex justify-content-between">
                                <input key={e} id={`file-input-${e}`} className="mb-2" type="file" disabled={status !== "input"} />
                                <span role="button" onClick={() => deleteFile(e)}>
                                    <i className="fas fa-times"></i>
                                </span>
                            </div>
                        })
                    }
                </div>
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
