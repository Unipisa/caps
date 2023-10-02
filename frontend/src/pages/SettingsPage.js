'use strict';

import React, {useState} from 'react'
import { Card, Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'

import { useIndex } from '../modules/engine'
import api from '../modules/api'
import LoadingMessage from '../components/LoadingMessage'

export default function SettingsPage({}) {
    const query = useIndex('settings', {})
    if (query.isLoading) return <LoadingMessage>caricamento settings</LoadingMessage>
    const settings = query.data
    return <SettingsInternal settings={settings} mutate={query.mutate} submit={submit}/>

    async function submit(data) {
        await api.post('settings', data)
        // query.mutate() // ERROR: query.mutate is not a function
    }
}

function SettingsInternal({settings, submit}) {
    const [data, setData] = useState(settings)
    return <div>
        <h1>Impostazioni</h1>
        <Form>
        <Card>
            <Card.Header>
                <Card.Title>Generali</Card.Title>
            </Card.Header>
            <Group label="Disclaimer">
                <Description>Questa scritta, se non vuota, viene mostrata in cima ad ogni pagina</Description>
                <textarea value={data.disclaimer} onChange={setter("disclaimer")}/>
            </Group>

            <Group label="Corso di studi">
                <input value={data.cds} onChange={setter("cds")}/>
            </Group>

            <Group label="Dipartimento">
                <input value={data.department} onChange={setter("department")}/>
            </Group>
            
            <Group label="Istruzioni per l'utente">
                <Description>Queste istruzioni vengono mostrate all'utente appena dopo il login, nella pagina
                    dove sono visibili tutti i piani di studio presentati.
                </Description>
                <textarea value={data.userInstructions} onChange={setter("userInstructions")} />
            </Group>
        </Card>

        <Card>
        <Card.Header>
            <Card.Title>Piani di studio</Card.Title>
        </Card.Header>
        <Group label="Notifiche e-mail">
            <Description>
                Questo campo contiene una lista di indirizzi e-mail, separati da virgole, che vengono
                notificati ad ogni nuova sottomissione e approvazione di un piano di studio.
            </Description>
            <input value={data.notifiedEmails} onChange={setter("notifiedEmails")}/>
        </Group> 

        <Group label="Firma per i piani">
            <Description>Questa firma viene apposta su ogni piano approvato, quando si
            seleziona il pulsante "Stampa piano".
            </Description>
            <input value={data.approvalSignatureText} onChange={setter("approvalSignatureText")}/>
        </Group>

        <Group label="Nome dei file .pdf">
            <Description>È possibile configurare il nome per i file .pdf che vengono
                scaricati cliccando su "Scarica in PDF" nella pagina di un piano di studio. Le stringhe '%d', '%s',
                '%n' e '%c' vengono sostituite con la data di ultima modifica, il cognome, il nome, e il curriculum,
                rispettivamente. Non è necessario includere l'estensione .pdf.
            </Description>
            <input value={data.pdfName} onChange={setter("pdfName")}/>
        </Group>
        </Card>
        <Button onClick={() => submit(data)}>Salva impostazioni</Button>
        </Form>
    </div>

    function setter(field) {
        return function(el) {
            setData({...data, [field]: el.target.value})
        }
    }
}

function Description({children}) {
    return <div>{children}</div>
}

function Group({ controlId, label, validationError, children, ...controlProps }) {
    return (
        <Form.Group className="mb-3" controlId={controlId} >
        <Form.Label><h4>{label}</h4></Form.Label><br />
        {
            children === undefined
            ? <Form.Control
            {...controlProps}
            className={validationError ? "border border-danger" : ""}
            />
            : children
        }
        {validationError && <Form.Label className="mb-0 text-danger">{validationError}</Form.Label>}
        </Form.Group>
    );
}
