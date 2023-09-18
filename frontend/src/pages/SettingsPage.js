'use strict';

import React from 'react'
import { Card, Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'

export default function SettingsPage({engine}) {
    const settings = {}
    return <div>
        <h1>Impostazioni</h1>
        <Form>
        <Card>
            <Card.Header>
                <Card.Title>Generali</Card.Title>
            </Card.Header>
            <Group controlId="caps-setting-disclaimer" label="Disclaimer">
                <Description>Questa scritta, se non vuota, viene mostrata in cima ad ogni pagina</Description>
                <textarea id="caps-setting-disclaimer" name="disclaimer">
                    {settings['disclaimer']}
                </textarea>
            </Group>

            <Group controlId="caps-setting-cds" label="Corso di studi">
                <input id="caps-setting-cds" type="text" name="cds" value={settings['cds']} />
            </Group>

            <Group controlId="caps-setting-department" label="Dipartimento">
                <input id="caps-setting-department" type="text" name="department" value={settings['department']} />
            </Group>
            
            <Group controlId="caps-setting-user-instructions" label="Istruzioni per l'utente">
                <Description>Queste istruzioni vengono mostrate all'utente appena dopo il login, nella pagina
                    dove sono visibili tutti i piani di studio presentati.
                </Description>
                <textarea id="caps-setting-user-instructions"
                name="user-instructions" class="form-control caps-settings-html">
                    { settings['user-instructions'] }
                </textarea>
            </Group>
    </Card>
    
    
    <Card>
        <Card.Header>
            <Card.Title>Piani di studio</Card.Title>
        </Card.Header>
        <Group controlId="caps-setting-notified-emails" label="Notifiche e-mail">
            <Description>
                Questo campo contiene una lista di indirizzi e-mail, separati da virgole, che vengono
                notificati ad ogni nuova sottomissione e approvazione di un piano di studio.
            </Description>
            <input id="caps-setting-notified-emails" type="text" class="form-control" name="notified-emails" value={settings['notified-emails']} />
        </Group> 

        <Group controlId="caps-setting-signature-text" label="Firma per i piani">
            <Description>Questa firma viene apposta su ogni piano approvato, quando si
            seleziona il pulsante "Stampa piano".
            </Description>
            <input id="caps-setting-signature-text" type="text" class="form-control" name="approval-signature-text" value={settings['approval-signature-text']} />
        </Group>

        <Group controlId="caps-setting-pdf-name" label="Nome dei file .pdf">
            <Description>È possibile configurare il nome per i file .pdf che vengono
                scaricati cliccando su "Scarica in PDF" nella pagina di un piano di studio. Le stringhe '%d', '%s',
                '%n' e '%c' vengono sostituite con la data di ultima modifica, il cognome, il nome, e il curriculum,
                rispettivamente. Non è necessario includere l'estensione .pdf.
            </Description>
            <input id="caps-setting-pdf-name" type="text" class="form-control" name="pdf-name" value={settings['pdf-name']} />
        </Group>
    </Card>
    <Button>Salva impostazioni</Button>
    </Form>
    </div>
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