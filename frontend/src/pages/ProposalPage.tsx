import React, { Dispatch, SetStateAction, useState } from 'react'
import { useParams } from "react-router-dom"
import {Button, ButtonGroup} from 'react-bootstrap' 
import assert from 'assert'

import { useEngine,
    useIndexExam, useGetProposal, usePostProposal,
    useIndexDegree, useIndexCurriculum, 
    useGetDegree, useGetCurriculum, useGetExam,
    ExamGet, ProposalGet, ProposalExamGet, ProposalPost,
    ProposalExamPost,
    CurriculumGet, CurriculumExamGet,
    DegreeGet,
} from '../modules/engine'
import LoadingMessage from '../components/LoadingMessage'
import Card from '../components/Card'
import {formatDate,displayAcademicYears} from '../modules/utils'
import StateBadge from '../components/StateBadge'
import {FlashCard} from '../components/Flash'

export function EditProposalPage() {
    const { id } = useParams()

    const proposalQuery = useGetProposal(id || '')

    if (proposalQuery.isError) return <LoadingMessage>errore piano di studi...</LoadingMessage>
    if (!proposalQuery.data) return <LoadingMessage>caricamento piano di studi...</LoadingMessage>


    return <ProposalForm proposal={proposalQuery.data}/>
}

export default function ProposalPage() {
    const engine = useEngine()
    const user = engine.user
    const { id } = useParams()

    const query = useGetProposal(id)
    const proposal = query.data
    const degreeQuery = useGetDegree(proposal?.degree_id)
    const curriculumQuery = useGetCurriculum(proposal?.curriculum_id)

    const degree:any = degreeQuery.data
    const curriculum = curriculumQuery.data

    if (!proposal || (proposal?.curriculum_id && (curriculum === null || degree === null))) {
        return <LoadingMessage>caricamento piano di studi...</LoadingMessage>
    }

    return <>
        <h1>Piano di studi di {proposal?.user_name}</h1>
        {proposal && <MessageCard />}
        {proposal && <InfoCard />}
        { proposal?.exams?.map((year_exams, index) => <Year key={index} number={index} exams={year_exams}/>)}
    </>

    function AdminButtons() {
        if (!proposal) return null
        if (engine.user.admin && proposal.state === 'submitted') return <>
            <Button>accetta</Button>
            <Button>rifiuta</Button>
        </>       
        return null
    }

    function ShareButton() {
        if (!proposal) return null
        if (degree 
            && degree.enable_sharing 
            && proposal.state === 'submitted' 
            && (user._id === proposal.user_id || user.admin)) {
                return <div className="dropdown">
                    <Button className="dropdown-toggle" data-toggle="dropdown">
                        Richiedi parere
                    </Button>
                    <div className="dropdown-menu p-3" style={{minWidth: "450px"}}>
                        <form>
                            <input name="email" placeholder="email"></input>
                            <input type="submit" value="richiedi parere"/>
                        </form>
                    </div>
                </div>
            }
        return null
    }

    function MessageCard() {
        if (!proposal) return null
        return <Card className={
            {
                'draft': "border-left-primary",
                'submitted': "border-left-warning",
                'approved': "border-left-success",
                'rejected': "border-left-error",
            }[proposal.state]
        }>{
            {
                draft: `Questo piano è in stato di bozza. Devi inviarlo per avere l'approvazione.`,
                submitted: `Il piano è stato inviato in data ${formatDate(proposal.date_submitted)}. Riceverai un email quando verrà approvato o rifiutato`,
                approved: `Il piano è stato approvato in data ${formatDate(proposal.date_managed)}.`,
                rejected: `Il piano è stato rigettato in data ${formatDate(proposal.date_managed)}. Puoi farne una copia, modificarlo e inviarlo nuovamente.`,
            }[proposal.state]
        }</Card>
    }

    function DownloadButtons() {
        return <>
            <a className="d-none d-md-inline" href="">
                <Button className="button-sm mr-2">
                    <i className="fas fa-file-pdf"></i> Scarica come PDF
                </Button>
            </a>
            <a className="d-none d-md-inline" href="">
                <Button className="button-sm">
                <i className="fas fa-file-pdf mr-2"></i>PDF inclusi i commenti
                </Button>
            </a>
            <div className="dropdown d-md-none">
                <Button className="btn-sm dropdown-toggle" data-toggle="dropdown">
                    <i className="fas fa-file-pdf"></i>
                </Button>
                <div className="dropdown-menu p-3">
                    <a className="dropdown-item" href="">
                        <i className="fas fa-file-pdf"></i> Scarica come PDF
                    </a>
                    <a className="dropdown-item" href="">
                        <i className="fas fa-file-pdf"></i> PDF inclusi i commenti
                    </a>
                </div>
            </div>
        </>
    }
    
    function ExamRow({ exam }) {
        const query = useGetExam(exam.exam_id || null)
        if (query.isLoading) return <tr><td>loading...</td></tr>
        if (query.isError) return <tr><td>error...</td></tr>
        const real_exam: any = query.data
        return <tr>
            <td>{exam.exam_code}</td>
            <td>{exam.exam_name}
                {real_exam && real_exam.tags.map(tag => 
                    <div key={tag} className="badge ml-1 badge-secondary badge-sm">
                        {tag}
                    </div>)}
            </td>
            <td>{exam.exam_sector}</td>
            <td>{exam.exam_credits}</td>
            <td>{{
                'CompulsoryExam': 'Obbligatorio',
                'CompulsoryGroup': exam.group,
                'FreeChoiceGroup': 'A scelta libera (G)',
                'FreeChoiceExam': 'A scelta libera',
                'ExternalExam': 'Esame Esterno',
            }[exam.__t]}
            </td>
        </tr>
    }

    function Year({number, exams}) {
        const yearName = ["Primo", "Secondo", "Terzo"][number] || `#${number}`

        return <Card title={`${yearName} anno`}>
            <table className="table">
                <thead>
                <tr>
                    <th>Codice</th>
                    <th>Nome</th>
                    <th>Settore</th>
                    <th>Crediti</th>
                    <th>Gruppo</th>
                </tr>
                </thead>
                <tbody>
                { exams .map(e => <ExamRow key={e._id} exam={e}/>) }
                </tbody>
            </table>
        </Card>
    }

    function InfoCard() {
        if (!proposal) return null
        return <Card>
            <div className="d-flex mb-2">
                <AdminButtons />
                <ShareButton />
                <div className="flex-fill" />
                <DownloadButtons />
            </div>
            <table className="table"><tbody>
                <tr>
                    <th>Stato</th>
                    <td><StateBadge state={proposal.state} /></td>
                </tr>
                <tr>
                    <th>Corso di Laurea</th>
                    <td>{proposal.degree_name}</td>
                </tr>
                <tr>
                    <th>Curriculum</th>
                    <td>{proposal.curriculum_name}</td>
                </tr>
                <tr>
                    <th>Anno di immatricolazione</th>
                    <td>{displayAcademicYears(proposal.degree_academic_year)}</td>
                </tr>                
            </tbody></table>        
        </Card>
    }
}

function ProposalForm({ proposal }:{
    proposal: ProposalGet
}) {
    const engine = useEngine()

    const [degreeId, setDegreeId] = useState(proposal.degree_id)
    const [curriculumId, setCurriculumId] = useState<string|null>(proposal.curriculum_id)

    const degreesQuery = useIndexDegree()
    const curriculaQuery = useIndexCurriculum(degreeId ? { degree_id: degreeId } : undefined )
    const examsQuery = useIndexExam()

    if (degreesQuery.isError) return <LoadingMessage>errore corsi di laurea...</LoadingMessage>
    if (degreesQuery.data === undefined) return <LoadingMessage>caricamento corsi di laurea...</LoadingMessage>

    const degrees = Object.fromEntries(degreesQuery.data.items.map(d => [d._id, d]))

    if (curriculaQuery.isError) return <LoadingMessage>errore curricula...</LoadingMessage>
    if (curriculaQuery.data === undefined) return <LoadingMessage>caricamento curricula...</LoadingMessage>

    const curricula = Object.fromEntries(curriculaQuery.data.items.map(c => [c._id, c]))

    if (examsQuery.isError) return <LoadingMessage>errore esami...</LoadingMessage>
    if (examsQuery.data === undefined) return <LoadingMessage>caricamento esami...</LoadingMessage>

    const allExams = Object.fromEntries(examsQuery.data.items.map(e => [e._id, e]))

    return <>
        <Card>
            <div className="form-group" key="degree-selection">
                <select className="form-control mb-3"
                    onChange={e => updateDegree(e.target.value)}
                    value={degreeId || -1}
                >
                    <option key="degree-dummy" value="-1" disabled>
                        Selezionare il corso di Laurea
                    </option>
                    {
                        Object.values(degrees).sort(
                            (a,b) => (b.academic_year - a.academic_year) || (a.name.localeCompare(b.name))
                        ).map((degree) => 
                                <option key={degree._id} value={degree._id}>
                                    {degree.name} &mdash; anno di immatricolazione {displayAcademicYears(degree.academic_year)}
                                </option>
                        )
                    }
                </select>
                
                {
                    degreeId && <>
                        <select className="form-control mb-3"
                            onChange={e => updateCurriculum(e.target.value)}
                            value={curriculumId || -1}
                        >
                            <option key="curriculum-dummy" value="-1" disabled>
                                Selezionare il Curriculum
                            </option>
                            {
                                Object.values(curricula).sort((a, b) => (a.name.localeCompare(b.name))).map(curriculum =>
                                        <option key={curriculum._id} value={curriculum._id}>
                                            {curriculum.name}
                                        </option>
                                )
                            }
                        </select>
                    </>
                }

            </div>
        </Card>
        { degreeId && curriculumId &&
            <ProposalFormYears proposal={proposal} curriculum={curricula[curriculumId]} degree={degrees[degreeId]} allExams={allExams}/>
        }   
    </>

    async function updateCurriculum(curriculum_id) {
        if (curriculumId) {
            if (!await engine.modalConfirm("Vuoi davvero cambiare curriculum?", "Cambiare curriculum comporta la perdita di tutte le modifiche non salvate. Procedere ugualmente?"))
                return
        }
        setCurriculumId(curriculum_id)
    }

    async function updateDegree(degree_id) {
        if (degreeId) {
            if (!await engine.modalConfirm("Vuoi davvero cambiare corso di Laurea?", "Cambiare corso di Laurea comporta la perdita di tutte le modifiche non salvate. Procedere ugualmente?"))
                return
        }
        setDegreeId(degree_id)
        setCurriculumId(null)
    }
}

function ProposalFormYears({ proposal, curriculum, allExams, degree }:{
    proposal: ProposalGet,
    curriculum: CurriculumGet,
    degree: DegreeGet,
    allExams: {[key: string]: ExamGet},
}) {
    const groups = Object.fromEntries(
        Object.entries(degree.groups).map(([group_id, group_exams]) => {
            const populated_exams = group_exams.flatMap(id => allExams[id] ? [ allExams[id] ] : [] ).sort((a: any, b: any) => a.name.localeCompare(b.name))
            return [group_id, populated_exams]
        }))

    const [chosenExams, setChosenExams] = useState<ProposalExamPost[][]>(fitExams(proposal, curriculum))

    // console.log(JSON.stringify({chosenExams,groups}))

    return <>
        {curriculum.years.map((yearExams, number) => <YearCard key={number} year={yearExams} number={number} allExams={allExams} chosenExams={chosenExams} setChosenExams={setChosenExams} groups={groups}/>)}
        <Submit proposal={proposal} curriculum={curriculum} chosenExams={chosenExams}/>
    </>

    function initExams(curriculum: CurriculumGet): ProposalExamPost[][] {
        return curriculum.years.map(year => year.exams.map(e => {
            if (e.__t === "CompulsoryExam") {
                return e.exam_id
            } else return null
        }))
    }

    function doExamsFit(exams: ProposalExamPost[][], curriculum: CurriculumGet) {
        if (exams.length !== curriculum.years.length) {
            console.log("doExamsFit: year count does not match")
            return false
        }

        for (const [i, year] of exams.entries()) {
            const c_year = curriculum.years[i]
            if (year.length !== c_year.exams.length) {
                console.log("year", i, "doExamsFit: exam count in year ${i} does not match")
                return false
            }

            for(const [j, exam_id] of exams[i].entries()) {
                const c_exam = c_year.exams[j]
                if (!doExamFit(exam_id, c_exam)) {
                    console.log("year", i, "exam", j, "doExamsFit: exam does not fit")
                    return false
                }
            }
        }

        return true
    }

    function doExamFit(exam: ProposalExamPost, c_exam: CurriculumExamGet): boolean {
        // console.log(JSON.stringify({exam_id, c_exam}))
        const exam_id: string = typeof(exam) === 'string' ? exam : ''
        const empty = exam === null
        switch(c_exam.__t) {
            case "CompulsoryExam":
                return !empty && exam_id === c_exam.exam_id
            case "CompulsoryGroup":
            case "FreeChoiceGroup":
                return empty || groups[c_exam.group].some(e => e._id === exam_id)
            case "FreeChoiceExam":
                return true
        }}

    function fitExams(proposal: ProposalGet, curriculum: CurriculumGet) {
        console.log('fitting exams...')
        let proposalExams: ProposalExamPost[][] = proposal.exams.map(year => year.map(exam => {
            if (exam === null) return null
            if (exam.__t === "ExternalExam") return {
                exam_name: exam.exam_name,
                exam_credits: exam.exam_credits,
            }
            else return exam.exam_id
        }))
        if (doExamsFit(proposalExams, curriculum)) return proposalExams
        // TODO: completa con un'euristica per fittare i vecchi esami nel nuovo curriculum
        console.log('exams do not fit: reset')
        proposalExams = initExams(curriculum)
        console.log(`${JSON.stringify({proposalExams, curriculum})}`)
        assert(doExamsFit(proposalExams, curriculum))
        return proposalExams
    }
}

function YearCard({ year, number, allExams, chosenExams, setChosenExams, groups }:{
    year: CurriculumGet['years'][0],
    number: number,
    allExams: {[key: string]: ExamGet},
    chosenExams: ProposalExamPost[][],
    setChosenExams: Dispatch<SetStateAction<ProposalExamPost[][]>>,
    groups: {[key: string]: ExamGet[]},
}) {
    const yearName = ["Primo", "Secondo", "Terzo"][number] || `#${number}`

    let credits = 0
    for (const e of chosenExams[number]) {
        if (e) {
            if (typeof(e)==='string') {
                credits += allExams[e].credits
            } else {
                credits += e.exam_credits
            }
        }
    }

    const customHeader = <div className='d-flex justify-content-between align-content-center'>
        <h5 className='text-white'>{yearName} anno</h5>
        <h5 className='text-white'>
            Crediti: <span className={credits < year.credits ? 'text-danger' : ''}>{credits}</span>/{year.credits}
        </h5>
    </div>

    return <Card customHeader={customHeader} >
        {year.exams.map((exam, examNumber) => <ExamSelect key={examNumber} exam={exam} allExams={allExams} groups={groups} chosenExam={chosenExams[number][examNumber]} setExam={examSetter(number, examNumber)}/>)}
        <div className='d-flex flex-row-reverse'>
            <button className='btn btn-primary'>Aggiungi esame esterno</button>
            <button className='btn btn-primary mr-2'>Aggiungi esame a scelta libera</button>
        </div>
    </Card>

    function examSetter(i, j) {
        return function(exam) {
            console.log(`setting exam year ${i} number ${j} to ${JSON.stringify(exam)}`)
            setChosenExams(old => old.map((lst, ii) => i!==ii ? lst : 
                lst.map((exm, jj) => j!==jj ? exm : exam)))
        }
    }
}

function ExamSelect({ exam, allExams, groups, chosenExam, setExam }:{
    exam: CurriculumExamGet,
    allExams: {[key: string]: ExamGet},
    groups: {[key: string]: ExamGet[]},
    chosenExam: ProposalExamPost,
    setExam: (e:string) => void,
}) {
    if (exam.__t === "CompulsoryExam") {
        const compulsoryExam = allExams[exam.exam_id]
        return <li className='form-group exam-input'>
            <div className='row'>
                <div className='col-9'>
                    <select className='form-control' disabled>
                        <option>{compulsoryExam.name}</option>
                    </select>
                </div>
                <div className="col-3">
                    <input className='form-control col' readOnly value={compulsoryExam.credits}/>
                </div>
            </div>
        </li>
    } else if (exam.__t === "CompulsoryGroup" || exam.__t === "FreeChoiceGroup") {
        const options = groups[exam.group]
        const exam_id = typeof(chosenExam) === 'string' ? chosenExam : ''

        return <li className='form-group exam-input'>
            <div className='row'>
                <div className='col-9'>
                    <select className='form-control'
                        value={exam_id}
                        onChange={e => {
                            setExam(e.target.value)
                        }}
                    >
                        <option disabled value="">Un esame a scelta nel gruppo {exam.group}</option>
                        {options && options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)}
                    </select>
                </div>
                <div className="col-3">
                    <input className='form-control col' readOnly value={chosenExam ? allExams[exam_id].credits : ""}/>
                </div>
            </div>
        </li>
    } else if (exam.__t === "FreeChoiceExam") {
        return <FreeChoiceExamSelect allExams={allExams} chosenExam={chosenExam} setExam={setExam}/>
    }
}

function FreeChoiceExamSelect({allExams, chosenExam, setExam}:{
    allExams: {[key:string]: ExamGet},
    chosenExam: ProposalExamPost,
    setExam: (string) => void,
}) {
    const options = Object.values(allExams).sort((a: any, b: any) => a.name.localeCompare(b.name))
    assert (chosenExam === null || typeof(chosenExam) === 'string')
    return <li className='form-group exam-input'>
        <div className='row'>
            <div className='col-9'>
                <select className='form-control' 
                    value={chosenExam || ''} 
                    onChange={e => setExam(e.target.value)}>
                    <option disabled value="">Un esame a scelta libera</option>
                    {options.map((opt:any) => <option key={opt._id} value={opt._id}>{opt.name}</option>)}
                </select>
            </div>
            <div className="col-2">
                <input className='form-control col' readOnly value={chosenExam?allExams[chosenExam].credits:""} />
            </div>
            <div className='col-1 btn my-auto'>
                <i className='fas fa-trash'></i>
            </div>
        </div>
    </li>
}

function Submit({proposal, curriculum, chosenExams}:{
    proposal: ProposalGet,
    curriculum: CurriculumGet,
    chosenExams: ProposalExamPost[][],
}) {
    const poster = usePostProposal()

    if (poster.isLoading) return <LoadingMessage />

    return <>
        {poster.isError && <FlashCard 
            className="danger" 
            message={`${poster.error} [${JSON.stringify(poster.data)}]`}
            onClick={poster.reset}
        />}
        <ButtonGroup>
            <Button variant="success" onClick={()=>submit('submitted')}>
                sottometti il piano di studi
            </Button>
            <Button variant="primary" onClick={()=>submit('draft')}>
                salva in bozza
            </Button>
        </ButtonGroup>
    </>

    function submit(state: "draft" | "submitted") {
        poster.mutate({
            _id: proposal._id || '',
            curriculum_id: curriculum._id,
            state,
            exams: chosenExams,
        })
    }

}