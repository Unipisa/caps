import mongoose, {Schema} from 'mongoose'
import Exam from './Exam'

const CurriculumExamSchema = new Schema({})

export const CurriculumSchema = new Schema({
    old_id: {
        type: Number,
        required: false
    },
    name: { 
        type: String, 
        required: true
    },
    notes: {
        type: String,
        required: false,
    },
    degree_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Degree'
    },
    years: [
        {
            credits: Number,
            exams: [
                CurriculumExamSchema
            ]
        }
    ]
})

const CurriculumExam = CurriculumSchema.path<Schema.Types.Subdocument>('years.exams')

export const CurriculumCompulsoryExam = CurriculumExam.discriminator("CompulsoryExam", new mongoose.Schema(
    {
        exam_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Exam
        }
    }))

export const CurriculumCompulsoryGroup = CurriculumExam.discriminator("CompulsoryGroup", new mongoose.Schema(
    {
        group: String
    }))

export const CurriculumFreeChoiceGroup = CurriculumExam.discriminator("FreeChoiceGroup", new mongoose.Schema(
    {
        group: String        
    }))
    
export const CurriculumFreeChoiceExam = CurriculumExam.discriminator("FreeChoiceExam", new mongoose.Schema(
     {}
))