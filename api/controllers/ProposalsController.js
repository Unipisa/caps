const { ObjectId } = require('mongoose').Types;

const ModelController = require('./ModelController');
const Proposal = require('../models/Proposal');
const Curriculum = require('../models/Curriculum');
const Degree = require('../models/Degree');
const { ForbiddenError, BadRequestError } = require('../exceptions/ApiException')

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
        const user = req?.user || null
        return await ModelController.index(Proposal, query, fields, user);
    }, 

    view: async req => {
        const { id } = req.params
        const user = req?.user || null
        return await ModelController.view(Proposal, id, user)
    },

    post: async req => {
        const user = req?.user || null
        const body = req.body
        const now = new Date()

        if (!user) throw new ForbiddenError("You must be logged in to create a proposal")
        
        // questo codice di validazione non è testato
        // inoltre probabilmente andrebbe spostato nella 
        // validazione del modello Proposal

        let state = body.state
        if (!req?.user?.admin && !["draft", "submitted"].includes(state)) {
            throw new ForbiddenError("You must be an admin to create a proposal with state other than 'draft' or 'submitted'")
        }

        const curriculum = await Curriculum.findOne({_id: new ObjectId(body.curriculum_id)})
        if (!curriculum) throw new BadRequestError("Curriculum not found")

        const degree = await Degree.findOne({_id: new ObjectId(curriculum.degree_id)})
        if (!degree) throw new BadRequestError("Degree not found")
        
        body.curriculum_id = new ObjectId(body.curriculum_id)
        body.curriculum_name = curriculum.name
        body.degree_academic_year = degree.academic_year
        body.degree_name = degree.name
        body.user_id = new ObjectId(req.user._id)
        body.user_last_name = req.user.last_name
        body.user_first_name = req.user.first_name
        body.user_name = req.user.name
        body.user_id_number = req.user.id_number
        body.user_email = req.user.email
        body.user_username = req.user.username
        body.date_managed = null
        body.date_modified = now
        body.date_submitted = state == "submitted" ? now : null
        body.attachments = []

        const credits = 0
        for (const e of body.exams) {
            switch (e.__t) {
                case 'CompulsoryExam':
                    if (curriculum.years[e.year-1].exams.filter(e => e.__t == 'CompulsoryExam' && e.exam_id == e.exam_id).length === 0) {
                        throw new BadRequestError(`Exam ${e.exam_id} not found in curriculum compulsory exams of year ${e.year}`)
                    }
                    break
                case 'CompulsoryGroup':
                    if (curriculum.years[e.year-1].exams.filter(e => e.__t == 'CompulsoryGroup' && e.group == e.group).length === 0) {
                        throw new BadRequestError(`Group ${e.group} not found in curriculum compulsory exams of year ${e.year}`)
                    }
                    break
                case 'FreeChoiceGroup':
                    if (curriculum.years[e.year-1].exams.filter(e => e.__t == 'FreeChoiceGroup' && e.group == e.group).length === 0) {
                        throw new BadRequestError(`Group ${e.group} not found in curriculum free choice exams of year ${e.year}`)
                    }
                    break
                case 'FreeChoiceExam':
                    if (curriculum.years[e.year-1].exams.filter(e => e.__t == 'FreeChoiceExam').length === 0) {
                        throw new BadRequestError(`No free choice exams for year ${e.year}`)
                    }
                    break
                case 'ExternalExam':
                    break
                default: 
                    throw new BadRequestError(`Invalid exam type ${e.__t}`)
            }
            if (e.exam_id) {
                e.exam_id = new ObjectId(e.exam_id)
                const exam = await Exam.findOne({_id: e.exam_id})
                e.exam_name = exam.name
                e.exam_code = exam.code
                e.exam_credits = exam.credits
            }
            if (e.year) {
                e.year = parseInt(e.year)
                if (isNaN(e.year)) throw new BadRequestError("Invalid year")
                if (e.year < 1 || e.year > degree.years) throw new BadRequestError("Invalid year")
            }
            if (e.group) {
                const lst = degree.groups[e.group]
                if (!lst) throw new BadRequestError(`Invalid group ${e.group}`)
                if (!lst.includes(e.exam_id)) throw new BadRequestError(`Invalid group ${e.group} for exam ${e.exam_id}`)
            }
            if (e.exam_credits) credits += e.exam_credits
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
            for (const e of body.exams) {
                if (e.exam_id) {
                    if (exam_ids.includes(e.exam_id)) throw new BadRequestError(`Exam ${e.exam_id} is present more than once`)
                    exam_ids.push(e.exam_id)
                }
                if (e.exam_name) {
                    if (exam_names.includes(e.exam_name)) throw new BadRequestError(`Exam ${e.exam_name} is present more than once`)
                    exam_names.push(e.exam_name)
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

        const proposal = new Proposal(body)
        return await proposal.save()
    }
}

module.exports = ProposalsController;
