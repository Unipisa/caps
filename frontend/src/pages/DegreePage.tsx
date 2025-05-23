import React, {useState} from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"
import { Form, Dropdown } from "react-bootstrap"
import MultiSelect from "react-bootstrap-multiselect"
import 'react-bootstrap-multiselect/css/bootstrap-multiselect.css'

import { useEngine, useGetDegree, useIndexExam, usePostDegree, usePatchDegree } from '../modules/engine'
import Card from '../components/Card'
import Group from '../components/Group'
import LoadingMessage from '../components/LoadingMessage'
import HTMLEditor from '../components/HTMLEditor'

export default function DegreePage() {
    const { id } = useParams();
    const query = useGetDegree(id || '')

    if (query.isLoading) return <LoadingMessage>caricamento corso di studi...</LoadingMessage>
    if (query.data === undefined) return <div>errore caricamento corso di studi</div>

    const degree = query.data

    return <>
        <h1>{ degree.name }</h1>
        <Card>
            <div className="d-flex mb-2">
                <Link to="/degrees">
                    <button type="button" className="btn btn-sm mr-2 btn-primary">
                        <i className="fas fa-arrow-left mr-2"></i>
                        Tutti i corsi di studi
                    </button>
                </Link>
                <a href={`/degrees/edit/${id}`}>
                    <button type="button" className="btn btn-sm mr-2 btn-primary">
                        Modifica
                    </button>
                </a>
                <a href="#" onClick={ () => confirm('Sei sicuro di voler cancellare questo esame?')}>
                    <button type="button" className="btn btn-sm mr-2 btn-danger">Elimina</button>
                </a>

                <div className="flex-fill"></div>

                <div className="btn btn-sm btn-primary mr-2" >
                    <i className="fas fa-download mr-2"></i> Esporta in CSV
                </div>
            </div>
            <table className="table">
                <thead>
                    <tr><th>Nome</th>
                    <td>{ degree.name }</td>
                    </tr></thead>
                <tbody>
                <tr>
                    <th>Anno accademico</th>
                    <td>{ degree.academic_year }/{ degree.academic_year + 1 }</td>
                </tr>
                <tr>
                    <th>Durata anni</th>
                    <td>{ degree.years }</td>
                </tr>
                <tr>
                    <th>Attivato</th>
                    <td>{ degree.enabled ? "attivo" : "non attivo"}</td>
                </tr>
                <tr>
                    <th>Richiesta parere</th>
                    <td>{ degree.enable_sharing ? "attiva" : "non attiva" }</td>
                </tr>
                <tr>
                    <th>Gruppo esami per la scelta libera</th>
                    <td> { degree.default_group || "tutti gli esami" } </td>
                </tr>
                <tr>
                    <th></th>
                    <td></td>
                </tr>
            </tbody></table>
        </Card>    

        <Card title="messaggi">
            <p>
            Questi messaggi vengono mostrati allo studente che visualizza il piano.
            Possono essere personalizzati per indicare le procedure da seguire nei vari casi. 
            </p>
            <table className="table">
                <tbody>
                    <tr>
                        <th>Messaggio invio</th>
                        <td dangerouslySetInnerHTML={{__html: degree.submission_message}} />
                    </tr>
                    <tr>
                        <th>Messaggio approvazione</th>
                        <td dangerouslySetInnerHTML={{__html: degree.approval_message}} />
                    </tr>
                    <tr>
                        <th>Messaggio rifiuto</th>
                        <td dangerouslySetInnerHTML={{__html: degree.rejection_message}} />
                    </tr>
                </tbody>
            </table>
        </Card>

        <Card title="Email">
            <p>
                L'approvazione, invio, e rifiuto di un piano di studi possono essere comuncati 
                via e-mail allo studente e agli indirizzi specificati nelle 
                <a href="/settings">impostazioni</a>.
                Questo avviene 
                solo per gli eventi selezionati qui. 
            </p>
            <table className="table">
                <tbody>
                    <tr>
                        <th>Invio</th>
                        <td>Email { degree.submission_confirmation ? "abilitata" : "disabilitata"}</td>
                    </tr>
                    <tr>
                        <th>Approvazione</th>
                        <td>Email { degree.approval_confirmation ? "abilitata" : "disabilitata"}</td>
                    </tr>
                    <tr>
                        <th>Rifiuto</th>
                        <td>Email { degree.rejection_confirmation ? "abilitata" : "disabilitata"}</td>
                    </tr>
                </tbody>
            </table>
        </Card>

        <Card title="Gruppi di esami">
            <table className="table">
                <tbody>
                    { Object.entries(degree.groups).map(([name, exams]) => 
                        <ExamGroup key={ name } name={ name } exam_ids={ exams }/>)}
                </tbody>
            </table>
        </Card>
    </>
}

function ExamGroup({ name, exam_ids }) {
    const query = useIndexExam({'ids': exam_ids.join(",")})

    if (query.isLoading) return <tr>
        <th>{ name }</th>
        <td> ...loading... </td>
    </tr>
    if (query.data === undefined) return <tr>
        <th>{ name }</th>
        <td> ...error... </td>
    </tr>

    const exams = query.data

    return <tr>
        <th>{ name }</th>
        <td>{  exams.items.map(e => e.name).join(", ") }</td>
    </tr>
}

export function EditDegreePage() {
    const { id } = useParams()
    const isNew = id === '__new__'
    const query = useGetDegree(id || '')
    const updater = usePatchDegree(id || '')
    const poster = usePostDegree()
    const exams = useIndexExam()
    const mutate = isNew ? poster.mutate : updater.mutate
    const degree = query.data
    const isEdit = degree?._id !== undefined

    if (query.isLoading || exams.isLoading) return <LoadingMessage>caricamento...</LoadingMessage>
    if (query.isError) return <div>Errore: {query.error.message}</div>
    if (exams.isError) return <div>Errore: {`${exams}`}</div>

    return <>
        <h1>{isEdit ? "Modifica" : "Nuovo"} corso di Laurea</h1>
        <DegreeForm mutate={mutate} degree={degree} exams={exams} />
    </>
}

function DegreeForm({ mutate, degree, exams }) {
    const options = [
        { label: 'Mela', value: 'mela' },
        { label: 'Banana', value: 'banana' },
        { label: 'Arancia', value: 'arancia' }
      ];
    
      const handleChange = (selectedOptions) => {
        console.log('Selezionato:', selectedOptions);
      };
    
      return (
        <div className="container mt-5">
          <h3>Frutta preferita</h3>
          <MultiSelect
            multiple
            onChange={handleChange}
            enableFiltering
            includeSelectAllOption
            buttonClass="btn btn-primary"
          >
            {options.map(option => 
                <option key={option.value} value={option.value}>{option.label}</option>)}
          </MultiSelect>  
        </div>
      );
    }

function DegreeForm_({mutate,degree,exams}) {
    const [data, setData] = useState(degree)
    const [validation, setValidation] = useState<any>({})
    const engine = useEngine()
    const navigate = useNavigate()
    const current_year = new Date().getFullYear()
    
    const [selectedOptions, setSelectedOptions] = useState([]);
    const options = [
        { value: 'One', selected: true },
        { value: 'Two' },
        { value: 'Three' }
    ];
    
    const handleChange = (selected) => {
        setSelectedOptions(selected);
    };
    return (
    <MultiSelect
    onChange={handleChange}
    data={options}
    multiple
    />
    );

    return <Card>
        <Group
            validationError={validation.name}
            controlId="name"
            label="Nome"
            type="text"
            value={data.name || ''}
            onChange={onChange("name")}
        />
        <Group
            validationError={validation.academic_year}
            controlId="academic_year"
            label="Anno accademico (solo anno di inizio)"
            type="number"
            value={data.academic_year || current_year}
            onChange={onChange("academic_year")}
        />
        <Group 
            validationError={validation.years}
            controlId="years"
            label="Anni"
            type="number"
            value={data.years || 3}
            onChange={onChange("years")}
        />
        <Group
            validationError={validation.enabled}
            controlId="enabled">
            <Form.Check 
                type="checkbox" 
                label="Attivato" 
                checked={data.enabled ?? false} 
                onChange={onChangeCheck("enabled")}
            />
        </Group>
        <Group 
            validationError={validation.sharing_mode}
            controlId="sharing_mode"
            label="Richiesta di parere">
            {} <Form.Select  aria-label='Richiesta di parere' value={data.sharing_mode} onChange={onChange("sharing_mode")}>
                    <option value="disabled">disabilitata</option>
                    <option value="enabled">abilitata</option>
                    <option value="admin">amministratori</option>
            </Form.Select>
        </Group>
        <h4>gruppi di esami</h4>

        <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
            Select Options
            </Dropdown.Toggle>
            <Dropdown.Menu>
            {["A","B","C"].map((option, index) => (
            <Dropdown.Item
                key={index}
                onClick={() => {}}
                active={["B"].includes(option)}
            >
            {option}
            </Dropdown.Item>
            ))}
            </Dropdown.Menu>
        </Dropdown>

        <Group 
            validationError={validation.default_group}
            controlId="default_group"
            label="gruppo esami a scelta libera">
            {} <Form.Select value={data.default_group} onChange={onChange("default_group")}>
                    <option value="">tutti gli esami</option>
                    { Object.keys(data.groups).map(name => 
                        <option value={name}>{name}</option>
                    ) }
            </Form.Select>
        </Group>
        
        <h4>notifiche email</h4>
        <Group
            validationError={validation.submission_confirmation}
            controlId="submission_confirmation">
            <Form.Check 
                type="checkbox" 
                label="conferma invio" 
                checked={data.submission_confirmation ?? true} 
                onChange={onChangeCheck("submission_confirmation")}
            />
        </Group>
        <Group
            validationError={validation.approval_confirmation}
            controlId="approval_confirmation">
            <Form.Check 
                type="checkbox" 
                label="conferma approvazione" 
                checked={data.approval_confirmation ?? true} 
                onChange={onChangeCheck("approval_confirmation")}
            />
        </Group>
        <Group
            validationError={validation.rejection_confirmation}
            controlId="rejection_confirmation">
            <Form.Check 
                type="checkbox" 
                label="conferma rifiuto" 
                checked={data.rejection_confirmation ?? true} 
                onChange={onChangeCheck("rejection_confirmation")}
            />
        </Group>

        <h4>messaggi</h4>
        <Group controlId="approval_message" label="Approvazione" style={{".mce-notification": {"display": 'none !important',}}}>
            <Form.Text>Questo messaggio viene mostrato allo studente quando visualizza un piano che è già stato approvato.</Form.Text>
            <HTMLEditor
                content={data.approval_message || ''}
                setContent={setContent("approval_message")}>
            </HTMLEditor>
        </Group>
        <Group controlId="rejection_message" label="Invio" style={{".mce-notification": {"display": 'none !important',}}}>
            <Form.Text>Questo messaggio viene mostrato allo studente quando invia un piano; può contenere ad esempio delle istruzioni da seguire dopo l'invio.</Form.Text>
            <HTMLEditor
                content={data.submission_message || ''}
                setContent={setContent("submission_message")}>
            </HTMLEditor>
        </Group>
        <Group controlId="rejection_message" label="Rifiuto" style={{".mce-notification": {"display": 'none !important',}}}>
            <Form.Text>Questo messaggio viene mostrato allo studente quando visualizza un piano che è stato rigettato.</Form.Text>
            <HTMLEditor
                content={data.rejection_message || ''}
                setContent={setContent("rejection_message")}>
            </HTMLEditor>
        </Group>
        <Group controlId="free_choice_message" label="Esami a scelta" style={{".mce-notification": {"display": 'none !important',}}}>
            <Form.Text>
            Questo messaggio viene mostrato allo studente quando seleziona un esame a scelta libera (modificando la struttura del piano). Può contenere indicazioni su come riportare esami di altre istituzioni, e/o che dettagli sia necessario inserire.</Form.Text>
            <HTMLEditor
                content={data.free_choice_message || ''}
                setContent={setContent("free_choice_message")}>
            </HTMLEditor>
        </Group>

        <pre>
            { JSON.stringify({data,exams},null,2)}
        </pre>
    </Card>

    function setContent(field) {
        return value => setData(data => ({...data, [field]: value}))
    }

    function onChange(field) {
        return e => setData(data => ({...data, [field]: e.target.value}))
    }    

    function onChangeCheck(field) {
        return e => setData(data => ({...data, [field]: e.target.checked}))
    }
}
