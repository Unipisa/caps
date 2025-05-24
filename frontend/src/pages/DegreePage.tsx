import React, {useState, Dispatch } from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"
import { Form } from "react-bootstrap"
import Select from "react-select"
import Button from 'react-bootstrap/Button'

import { useEngine, useGetDegree, useIndexExam, usePostDegree, usePatchDegree, ExamGet } from '../modules/engine'
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
                    <tr>
                        <th><i>scelta libera</i></th>
                        <td> { degree.default_group ? `gruppo ${degree.default_group}` : <i>tutti gli esami</i> } </td>
                    </tr>
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
    const exams_query = useIndexExam()
    const mutate = isNew ? poster.mutate : updater.mutate
    const degree = query.data
    const isEdit = degree?._id !== undefined

    if (query.isLoading || exams_query.isLoading) return <LoadingMessage>caricamento...</LoadingMessage>
    if (query.isError) return <div>Errore: {query.error.message}</div>
    if (exams_query.isError || !exams_query.data) return <div>Errore: {`${exams_query}`}</div>

    const exams = exams_query.data.items

    return <>
        <h1>{isEdit ? "Modifica" : "Nuovo"} corso di Laurea</h1>
        <DegreeForm mutate={mutate} degree={degree} exams={exams} />
    </>
}

type ExamGroup = {
    name: string,
    exam_ids: string[]
}

function DegreeForm({mutate, degree, exams}) {
    const current_year = new Date().getFullYear()
    const [error, setError] = useState<string>('')
    const [data, setData] = useState({
        academic_year: current_year,
        years: 3,
        ...degree})
    const [groups, setGroups] = useState<ExamGroup[]>(Object.entries(degree.groups as Record<string,string[]>)
        .map(([name,exam_ids])=>({name, exam_ids}))
        .sort((a, b) => a.name.localeCompare(b.name))
    )
    const [validation, setValidation] = useState<any>({})
    const engine = useEngine()
    const navigate = useNavigate()
          
    return <Card>
        {error && <div className="alert alert-danger">{error}</div>}
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
            value={data.academic_year}
            onChange={onChange("academic_year")}
        />
        <Group 
            validationError={validation.years}
            controlId="years"
            label="Anni"
            type="number"
            value={data.years}
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

        <EditGroups groups={groups} setGroups={setGroups} exams={exams} />

        <Group 
            validationError={validation.default_group}
            controlId="default_group"
            label="gruppo esami a scelta libera">
            {} <Form.Select value={data.default_group} onChange={onChange("default_group")}>
                    <option value="">tutti gli esami</option>
                    { groups.map(group => 
                        <option key={group.name} value={group.name}>{group.name}</option>
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

        <Button onClick={submit}>salva corso di Laurea</Button>

        {/* <pre>
            { JSON.stringify({data,exams},null,2)}
        </pre> */}
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

    function submit() {
        const groups_array = Object.fromEntries(groups.map(group => [group.name, group.exam_ids]))
        const academic_year = parseInt(data.academic_year)
        const years = parseInt(data.years)
        const payload = {
            ...data,
            academic_year,
            years,
            groups: groups_array,
        }
        console.log(`submitting`, JSON.stringify({payload,data,degree}, null, 2))
        mutate(payload,
            {
                onSuccess: (res) => {
                    const id = degree._id || res.data
                    navigate(`/degrees/${id}`)
                },
                onError: (err) => {
                    if (err.response?.status === 422) {
                        setValidation(err.response.data.issues)
                        setError(`${err.response.data.message}`)
                    } else {
                        setError(`${err}`)
                    }
                }
            }
        )
    }
}

function EditGroups({groups, setGroups, exams}:{
    groups: ExamGroup[],
    setGroups: Dispatch<ExamGroup[]>,
    exams: ExamGet[]
}) {
    const examDict = Object.fromEntries(exams.map(exam => [exam._id,exam]))
    return <>
        { groups.map((group,i) => 
            <EditGroup 
                key={i} 
                name={group.name} 
                setName={name => setGroups(groups.map(g => (g.name===group.name 
                    ? {name, exam_ids: g.exam_ids} 
                    : g)))}
                group={group.exam_ids}
                setGroup={ids => setGroups(groups.map(g => (g.name===group.name
                    ? {name: g.name, exam_ids: ids}
                    : g)))}
                examDict={examDict} 
                erase={() => setGroups(groups.filter(g => g.name !== group.name))}
            />)}
        <Button onClick={add_group} disabled={groups.filter(group => group.name==="").length>0}>
            aggiungi gruppo di esami
        </Button>
    </>

    function add_group() {
        setGroups([...groups, {name: "", exam_ids: []}])
    }
}

type Option = {
    value: string;
    label: string;
  };

function EditGroup({name, setName, group, setGroup, examDict, erase}:{
    name: string
    setName: Dispatch<string>
    group: string[]
    setGroup: Dispatch<string[]>
    examDict: Record<string, {_id: string, name: string, code: string}>
    erase: () => void
}) {
    const sort_fun = (a,b) => a.label.localeCompare(b.label)
    const options: Option[] = Object.values(examDict).map(option_from_exam).sort(sort_fun)
    const selected: Option[] = group.map(option_from_exam_id).sort(sort_fun)

    // TODO: l'ordinamento non funziona
    // sembra che la select ordini sempre in base al codice

    return <Group controlId={`group-${name}`} label="gruppo">
        {} <input value={name} onChange={e => setName(e.target.value)} />
        {} <Button variant="danger" onClick={erase}>elimina gruppo</Button>
        <Select isMulti isSearchable 
            options={options} 
            value={selected}
            onChange={onChange}
        />
    </Group>

    function option_from_exam(exam) {
        return {
            value: exam?._id,
            label: `${exam.code} ${exam.name}`
        }
    }

    function option_from_exam_id(exam_id) {
        const exam = examDict[exam_id]
        if (!exam) return {value: exam_id, label: exam_id}
        return option_from_exam(exam)
    }

    function onChange(new_options: readonly Option[]) {
        setGroup(new_options.map(option => option.value))
    }
}