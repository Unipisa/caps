const { ObjectId } = require('mongoose').Types;
const assert = require('assert')

const ModelController = require('./ModelController');
const Proposal = require('../models/Proposal');
const Curriculum = require('../models/Curriculum');
const Degree = require('../models/Degree');
const Exam = require('../models/Exam');
const { ForbiddenError, BadRequestError, ValidationError } = require('../exceptions/ApiException')

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
        const restrict = user.admin ? [] : [
            // restrict to owned proposals
            {$match: {
                "user_id": user._id
            }}
        ]

        const pipeline = ModelController.queryFieldsToPipeline(query, fields)

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
        const issues = {}
        let has_issues = false
        
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

        const curriculum = await Curriculum.findOne({_id: new ObjectId(body.curriculum_id)})
        if (!curriculum) throw new BadRequestError("Curriculum not found")

        const degree = await Degree.findOne({_id: new ObjectId(curriculum.degree_id)})
        if (!degree) throw new BadRequestError("Degree not found")
        const obj = {
            state,
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
            exams: curriculum.years.map(_ => []),
        }

        let credits = 0

        if (body.exams.length !== curriculum.years.length) throw new BadRequestError(`Years count mismatch`)

        issues.exams = []
        for (let year=0; year < curriculum.years.length; ++year) {
            const year_exams = curriculum.years[year].exams
            if (body.exams[year].length<year_exams.length) throw new BadRequestError(`Exam count in year ${year+1} mismatch`)
            issues.exams[year] = []
            for (let j=0; j<year_exams.length; ++j) {
                const e = year_exams[j]
                let exam_id = body.exams[year][j]
                let exam = null
                if (exam_id && typeof(exam_id)==='string') {
                    try {
                        exam_id = new ObjectId(exam_id)
                        exam = await Exam.findOne({_id: exam_id})
                    } catch(err) {
                        throw new BadRequestError(`invalid object id ${exam_id}`)                    
                    }
                }
                if (e.__t === 'CompulsoryExam') {
                    if (!e.exam_id.equals(exam_id)) {
                        throw new BadRequestError(`Exam ${e.exam_id} expected in curriculum year ${year+1} position ${j+1}`)
                    }
                    obj.exams[year].push({
                        __t: e.__t,
                        exam_id,
                        exam_name: exam.name,
                        exam_code: exam.code,
                        exam_credits: exam.credits,
                    })
                    credits += exam.credits
                } else if (e.__t === 'CompulsoryGroup' || e.__t === 'FreeChoiceGroup') {
                    if (exam_id === null) {
                        if (e.__t === 'CompulsoryGroup' && state !== 'draft' ) {
                            issues.exams[year][j] = `L'esame di un gruppo obbligatorio deve essere scelto`
                            has_issues = true
                        }
                        obj.exams[year].push(null)
                    } else {
                        if (!degree.groups.get(e.group)?.includes(exam_id)) {
                            throw new BadRequestError(`Exam not in group ${e.group} year ${year+1} position ${j+1}`)
                        }
                        obj.exams[year].push({
                            __t: e.__t,
                            group: e.group,
                            exam_id,
                            exam_name: exam.name,
                            exam_code: exam.code,
                            exam_credits: exam.credits,
                        })
                        credits += exam.credits
                    }
                } else if (e.__t === 'FreeChoiceExam') {
                    if (exam_id === null) {
                        if (state !== 'draft') {
                            issues.exams[year][j] = `L'esame a scelta libera deve essere scelto`
                            has_issues = true
                        }
                        obj.exams[year].push(null)
                    } else {
                        obj.exams[year].push({
                            __t: e.__t,
                            exam_id,
                            exam_name: exam.name,
                            exam_code: exam.code,
                            exam_credits: exam.credits,
                        })
                        credits += exam.credits
                    }
                } else {
                    assert(false,`unexpected type ${e.__t} in curriculum`)
                }
            }
            // additional exams
            for (j=year_exams.length;j<body.exams[year].length;j++) {
                const exam_id = body.exams[year][j]
                if (typeof(exam_id) === 'string') {
                    try {
                        exam_id = new ObjectId(exam_id)       
                    } catch(err) {
                        throw new BadRequestError(`invalid object_id ${exam_id} year ${year+1} position ${j+1}`)
                    }
                    const exam = await Exam.findOne({_id: exam_id})
                    if (!exam) throw new BadRequestError(`Exam not found with id ${exam_id} year ${year+1} position ${j+1}`)
                    obj.exams[year].append({
                        __t: 'FreeChoiceExam',
                        exam_id,
                        exam_name: exam.name,
                        exam_code: exam.code,
                        exam_credits: exam.credits,
                    })
                    credits += exam.credits
                } else {
                    const exam_name = exam_id.exam_name
                    const exam_credits = ParseInt(exam_id.exam_credits)
                    if (!exam_name) throw new BadRequestError(`External exam name invalid`)
                    if (isNaN(exam_credits)) throw new BadRequestError(`Invalid credits number`)
                    obj.exams[year].append({
                        __t: 'ExternalExam',
                        exam_name,
                        exam_credits,
                    })
                    credits += exam_credits
                }
            }
        }

        if (has_issues) {
            throw new ValidationError(issues,'Errore di validazione')
        }

        if (state === 'submitted') {
            // ci sono abbastanza crediti?
            const curriculum_credits = curriculum.years.reduce((acc, y) => acc + y.credits, 0)
            if (credits < curriculum_credits) {
                throw new BadRequestError("Not enough credits")
            }

            let exam_ids = []
            let exam_names = []

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
        console.log(`creating proposal with body ${JSON.stringify(obj)}`)
        const proposal = new Proposal(obj)
        return await proposal.save()
    },

    delete: async req => {
        const { id } = req.params
        const user = req.user 
        assert(user) 

        const proposal = await Proposal.findById(id)
        if (!user.admin && proposal.user_id != user._id) throw new ForbiddenError("You must be an admin to delete a proposal that is not yours")

        return await ModelController.delete(Proposal, id)
    }
}

module.exports = ProposalsController;
