
const mongoose = require('mongoose');
const Exam = require('./Exam')
// const Curriculum = require('./Curriculum')

const CurriculumExamSchema = new mongoose.Schema({})

const CurriculumSchema = new mongoose.Schema({
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
    degree: {
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

exports.CurriculumSchema = CurriculumSchema;

/*
const CurriculumExam = mongoose.model("CurriculumExam", 
    new mongoose.Schema({ }, options));

exports.CurriculumExam = CurriculumExam;
*/

const CurriculumExam = CurriculumSchema.path('years.exams')

const CurriculumCompulsoryExam = CurriculumExam.discriminator("CompulsoryExam", new mongoose.Schema(
    {
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Exam
        }
    }))

exports.CurriculumCompulsoryExam = CurriculumCompulsoryExam

const CurriculumCompulsoryGroup = CurriculumExam.discriminator("CompulsoryGroup", new mongoose.Schema(
    {
        group: String
    }))

exports.CurriculumCompulsoryGroup = CurriculumCompulsoryGroup

const CurriculumFreeChoiceGroup = CurriculumExam.discriminator("FreeChoiceGroup", new mongoose.Schema(
    {
        group: String        
    }))
    
exports.CurriculumFreeChoiceGroup = CurriculumFreeChoiceGroup

const CurriculumFreeChoiceExam = CurriculumExam.discriminator("FreeChoiceExam", new mongoose.Schema(
     {}
))

exports.CurriculumFreeChoiceExam = CurriculumFreeChoiceExam;