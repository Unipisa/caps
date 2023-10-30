import { Types, PipelineStage } from 'mongoose'
import assert from 'assert'

import Proposal from '../models/Proposal'
import ModelController from './ModelController'
import Curriculum from '../models/Curriculum'
import Degree from '../models/Degree'
import Exam from '../models/Exam'
import { ForbiddenError, BadRequestError } from '../exceptions/ApiException'
import { CurriculumGet, ProposalExamGet } from '../../frontend/src/modules/engine'

const ObjectId = Types.ObjectId

const fields = {
    "state": {
        can_filter: true,
    },
    date_managed: {
        can_filter: true,
        can_sort: true,
    },
    date_submitted: {
        can_filter: true,
        can_sort: true,
    },
    date_modified: {
        can_filter: true,
        can_sort: true,
    },    
    "user_id": {
        can_filter: true,
        can_sort: true,
        match_id_object: true,
    },
    "user_last_name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "user_first_name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "user_name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "curriculum_year": {
        can_filter: true,
        can_sort: true 
    },
    "curriculum_name": {
        can_filter: true,
        can_sort: true
    },
    "degree_name": {
        can_filter: true,
        can_sort: true
    }
};

const ProposalsController = {
    index: async req => {
        const query = req.query
        const user = req.user 
        const restrict: PipelineStage[] = user.admin ? [] : [
            // restrict to owned proposals
            {$match: {
                "user_id": user._id
            }}
        ]

        const pipeline: PipelineStage[] = ModelController.queryFieldsToPipeline(query, fields)

        const [ res ] = await Proposal.aggregate([
            ...restrict,
            ...pipeline,
        ])

        return res
    }, 

    view: async req => {
        const { id } = req.params
        const user = req?.user || null
        return await ModelController.view(Proposal, id)
    },

    post: async req => {
        // non usiamo ModelController.post perché
        // la validazione risulta troppo complicata
        // da fare nel Model

        // TODO: sollevare le eccezioni ValidateError

        const user = req.user
        const body = req.body
        const now = new Date()
        
        // l'autenticazione viene controllata nel router
        // dunque l'utente ci deve essere
        assert(user)

        // questo codice di validazione non è testato
        // inoltre probabilmente andrebbe spostato nella 
        // validazione del modello Proposal

        let state = body.state
        if (!user.admin && !["draft", "submitted"].includes(state)) {
            throw new ForbiddenError("You must be an admin to create a proposal with state other than 'draft' or 'submitted'")
        }

        const curriculum: CurriculumGet|null = await Curriculum.findOne({_id: new ObjectId(body.curriculum_id)})
        if (!curriculum) throw new BadRequestError("Curriculum not found")

        const degree = await Degree.findOne({_id: new ObjectId(curriculum.degree_id)})
        if (!degree) throw new BadRequestError("Degree not found")

        let credits = 0

        if (body.exams.length !== curriculum.years.length) throw new BadRequestError(`Years count mismatch`)

        const exams: ProposalExamGet[][] = curriculum.years.map(_ => [])

        for (let year=0; year < curriculum.years.length; ++year) {
            const year_exams = curriculum.years[year].exams
            if (body.exams[year].length<year_exams.length) throw new BadRequestError(`Exam count in year ${year+1} mismatch`)
            for (let j=0; j<year_exams.length; ++j) {
                const e = year_exams[j]
                let exam_id = body.exams[year][j]
                if (typeof(exam_id) === 'object') throw new BadRequestError(`invalid object id ${exam_id} at year ${year+1} position ${j+1}`)
                const exam = await getExam(exam_id) 
                if (e.__t === 'CompulsoryExam') {
                    if (e.exam_id !== exam_id) {
                        throw new BadRequestError(`Exam ${e.exam_id} expected in curriculum year ${year+1} position ${j+1}`)
                    }
                    exam_id = new ObjectId(exam_id)
                    if (!exam) throw new BadRequestError(`Exam ${exam_id} does not exist`)
                    exams[year].push({
                        __t: e.__t,
                        exam_id,
                        exam_name: exam.name || '',
                        exam_code: exam.code,
                        exam_credits: exam.credits || 0,
                    })
                    credits += exam.credits || 0
                } else if (e.__t === 'CompulsoryGroup' || e.__t === 'FreeChoiceGroup') {
                    if (exam === null && e.__t === 'CompulsoryGroup' && state !== 'draft' ) {
                        throw new BadRequestError(`Exam not choosen in compulsory group`)
                    } 
                    if (exam !== null) {
                        if (!degree.groups[e.group]?.contains(exam_id)) {
                            throw new BadRequestError(`Exam not in group ${e.group} year ${year+1} position ${j+1}`)
                        }
                        exams[year].push({
                            __t: e.__t,
                            group: e.group,
                            exam_id,
                            exam_name: exam.name || '',
                            exam_code: exam.code,
                            exam_credits: exam.credits || 0,
                        })
                        credits += exam.credits || 0
                    }
                } else {
                    assert(false,`unexpected type ${e.__t} in curriculum`)
                }
            }
            // additional exams
            for (let j=year_exams.length;j<body.exams[year].length;j++) {
                const exam_id = body.exams[year][j]
                const exam = await getExam(exam_id)
                if (exam) {
                    exams[year].push({
                        __t: 'FreeChoiceExam',
                        exam_id,
                        exam_name: exam.name || '',
                        exam_code: exam.code,
                        exam_credits: exam.credits || 0,
                    })
                    credits += exam.credits || 0
                } else {
                    const exam_name = exam_id.exam_name
                    const exam_credits = parseInt(exam_id.exam_credits)
                    if (!exam_name) throw new BadRequestError(`External exam name invalid`)
                    if (isNaN(exam_credits)) throw new BadRequestError(`Invalid credits number`)
                    exams[year].push({
                        __t: 'ExternalExam',
                        exam_name,
                        exam_credits,
                    })
                    credits += exam_credits
                }
            }
        }

        if (state === 'submitted') {
            // ci sono abbastanza crediti?
            const curriculum_credits = curriculum.years.reduce((acc, y) => acc + y.credits, 0)
            if (credits < curriculum_credits) {
                throw new BadRequestError("Not enough credits")
            }

            let exam_ids: string[] = []
            let exam_names: string[] = []

            // gli esami inseriti sono tutti diversi?
            for (const year_exams of body.exams) {
                for (const e of year_exams) {
                    if (e.exam_id) {
                        if (exam_ids.includes(e.exam_id)) throw new BadRequestError(`Exam ${e.exam_id} is present more than once`)
                        exam_ids.push(e.exam_id)
                    }
                    if (e.exam_name) {
                        if (exam_names.includes(e.exam_name)) throw new BadRequestError(`Exam ${e.exam_name} is present more than once`)
                        exam_names.push(e.exam_name)
                    }
                }
            }

            // ci sono tutti gli esami richiesti?            
            for (const year of curriculum.years) {
                for (const e of year.exams) {
                    if (e.__t == 'CompulsoryExam' && !exam_ids.includes(e.exam_id)) {
                        throw new BadRequestError(`Missing compulsory exam ${e.exam_id}`)
                    }
                    if (e.__t == 'CompulsoryGroup' && !exam_ids.some(id => degree.groups[e.group].includes(id))) {
                        throw new BadRequestError(`Missing exam in compulsory group ${e.group}`)
                    }
                }
            }
        }

        const obj = new Proposal({
            curriculum_id: new ObjectId(body.curriculum_id),
            curriculum_name: curriculum.name,
            degree_academic_year: degree.academic_year,
            degree_name: degree.name,
            user_id: new ObjectId(req.user._id),
            user_last_name: req.user.last_name,
            user_first_name: req.user.first_name,
            user_name: req.user.name,
            user_id_number: req.user.id_number,
            user_email: req.user.email,
            user_username: req.user.username,
            date_managed: null,
            date_modified: now,
            date_submitted: state == "submitted" ? now : null,
            attachments: [],
            exams,
        })

        const proposal = new Proposal(obj)
        return await proposal.save()
    },

    delete: async req => {
        const { id } = req.params
        const user = req.user 
        assert(user) 

        const proposal = await Proposal.findById(id)
        if (!proposal) throw new BadRequestError(`proposal ${id} not found`)
        if (!user.admin && proposal.user_id != user._id) throw new ForbiddenError("You must be an admin to delete a proposal that is not yours")

        return await ModelController.delete(Proposal, id)
    }
}

module.exports = ProposalsController;

async function getExam (exam_id) {
    if (exam_id && typeof(exam_id)==='string') {
        try {
            exam_id = new ObjectId(exam_id)
            return await Exam.findOne({_id: exam_id})
        } catch(err) {
            throw new BadRequestError(`invalid object id ${exam_id}`)                    
        }
    } else {
        return null
    }
}