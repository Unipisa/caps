import mongoose, {Schema} from 'mongoose'
import Exam from './Exam'

const ProposalExamSchema = new mongoose.Schema({})

const ProposalAttachmentSchema = new mongoose.Schema({})

export const ProposalSchema = new mongoose.Schema({
    old_id: {
        type: Number,
        required: false
    },
    degree_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Degree'
    },
    degree_academic_year: {
        type: Number,
    },
    degree_name: {
        type: String,
    },
    curriculum_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Curriculum'
    },
    curriculum_name: {
        type: String,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'   
    },
    user_last_name: {
        type: String,
    },
    user_first_name: {
        type: String,
    },
    user_name: {
        type: String,
    },
    user_id_number: {
        type: String,
    },
    user_email: {
        type: String,
    },
    user_username: {
        type: String,
    },
    state: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'rejected'],
    }, 
    date_modified: {
        type: Date,
    },
    date_submitted: {
        type: Date,
    },
    date_managed: {
        type: Date,
    },
    exams: [
        // Il primo array itera sugli anni. Il secondo array itera sugli esami di quell'anno
        [
            ProposalExamSchema
        ]
    ],
    attachments: [
        ProposalAttachmentSchema
    ],
})

const ProposalExam = ProposalSchema.path<Schema.Types.Subdocument>('exams')

export const ProposalCompulsoryExam = ProposalExam.discriminator("CompulsoryExam", new mongoose.Schema(
    {
        exam_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Exam
        },
        exam_name: String,
        exam_code: String,
        exam_credits: Number,
        // year: Number
    }))

export const ProposalCompulsoryGroup = ProposalExam.discriminator("CompulsoryGroup", new mongoose.Schema(
    {
        group: String,
        exam_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Exam,
            null: true,
        },
        exam_name: String,
        exam_code: String,
        exam_credits: Number,
        // year: Number
    }))

export const ProposalFreeChoiceGroup = ProposalExam.discriminator("FreeChoiceGroup", new mongoose.Schema(
    {
        group: String,     
        exam_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Exam,
            null: true
        },
        exam_name: String,
        exam_code: String,
        exam_credits: Number,
        // year: Number
    }))
    
export const ProposalFreeChoiceExam = ProposalExam.discriminator("FreeChoiceExam", new mongoose.Schema(
     {
        exam_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Exam,
            null: true,
        },
        exam_name: String,
        exam_code: String,
        exam_credits: Number,
        // year: Number
     }
))

export const ProposalExternalExam = ProposalExam.discriminator("ExternalExam", new mongoose.Schema(
    {
       exam_name: String,
       exam_credits: Number,
       // year: Number
    }
))

const ProposalAttachment = ProposalSchema.path<Schema.Types.Subdocument>('attachments')

export const ProposalAuthAttachment = ProposalAttachment.discriminator("AuthAttachment", new mongoose.Schema({
    email: String,
    secret: String,
    date_created: Date 
}))

export const ProposalFileAttachment = ProposalAttachment.discriminator("FileAttachment", new mongoose.Schema({
    filename: String,
    data: Buffer,
    mimetype: String,
    comment: String,
    date_created: Date
}))

export const ProposalCommentAttachment = ProposalAttachment.discriminator("CommentAttachment", new mongoose.Schema({
    comment: String,
    date_created: Date
}))
