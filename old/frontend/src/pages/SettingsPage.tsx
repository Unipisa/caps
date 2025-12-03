import React, {useState} from 'react'
import { Button } from 'react-bootstrap'
import Card from '../components/Card'
import Form from 'react-bootstrap/Form'
import HTMLEditor from '../components/HTMLEditor'


import { useIndex, usePost } from '../modules/engine'
import LoadingMessage from '../components/LoadingMessage'

export default function SettingsPage({}) {
    const query = useIndex(['settings'], {})
    const mutator = usePost(['settings'])

    if (query.isLoading) return <LoadingMessage>caricamento settings</LoadingMessage>
    const settings = query.data

    return <SettingsInternal settings={settings} submit={submit}/>

    async function submit(data) {
        console.log("submit", data)
        await mutator.mutate(data)
        // await axios.post('/api/v0/settings', data)
        // query.mutate() // ERROR: query.mutate is not a function
    }
}

function SettingsInternal({settings, submit}:{
    settings: any,
    submit: (data: any) => void,
}) {
    const [data, setData] = useState(settings)
    return <div>
        <h1>Impostazioni</h1>
        <Form>
        <Card title="Generali">
        <Form.Group className="my-3">
            <Form.Label>Disclaimer</Form.Label>                
            <Form.Control value={data.disclaimer} onChange={setter("disclaimer")}/>
            <Form.Text>Questa scritta, se non vuota, viene mostrata in cima ad ogni pagina.</Form.Text>
        </Form.Group>

        <Form.Group className="my-3">
            <Form.Label>Corso di studi</Form.Label>
            <Form.Control value={data.cds} onChange={setter("cds")}/>
        </Form.Group>

        <Form.Group className="my-3">
            <Form.Label>Nome del dipartimento</Form.Label>
            <Form.Control value={data.department} onChange={setter("department")}/>
        </Form.Group>
            
        <Form.Group className="my-3">
            <Form.Label>Istruzioni per l'utente</Form.Label>
            <HTMLEditor content={data.userInstructions} setContent={(content) => setData({ ...data, "userInstructions": content })} />
            <Form.Text>Queste istruzioni vengono mostrate all'utente appena dopo il login, nella pagina
                dove sono visibili tutti i piani di studio presentati.
                </Form.Text>
        </Form.Group>
        </Card>

        <Card title="Piani di studio">
        <Form.Group className="my-3">
            <Form.Label>Notifiche e-mail</Form.Label>
            <Form.Control value={data.notifiedEmails} onChange={setter("notifiedEmails")}/>
            <Form.Text>
                Questo campo contiene una lista di indirizzi e-mail, separati da virgole, che vengono
                notificati ad ogni nuova sottomissione e approvazione di un piano di studio.
            </Form.Text>
        </Form.Group> 

        <Form.Group className='my-3'>
            <Form.Label>Firma per i piani</Form.Label>
            <Form.Control value={data.approvalSignatureText} onChange={setter("approvalSignatureText")}/>
            <Form.Text>Questa firma viene apposta su ogni piano approvato, quando si
            seleziona il pulsante "Stampa piano".
            </Form.Text>
        </Form.Group>

        <Form.Group>
            <Form.Label>Nome dei file .pdf</Form.Label>
            <Form.Control value={data.pdfName} onChange={setter("pdfName")}/>
            <Form.Text>È possibile configurare il nome per i file .pdf che vengono
                scaricati cliccando su "Scarica in PDF" nella pagina di un piano di studio. Le stringhe '%d', '%s',
                '%n' e '%c' vengono sostituite con la data di ultima modifica, il cognome, il nome, e il curriculum,
                rispettivamente. Non è necessario includere l'estensione .pdf.
            </Form.Text>
        </Form.Group>
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

function Description({children}:{
    children: any
}) {
    return <div>{children}</div>
}

function Group({ controlId, label, validationError, children, ...controlProps }:{
    controlId?: string,
    label: string,
    validationError?: string,
    children?: any,
    controlProps?: any
}) {
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
