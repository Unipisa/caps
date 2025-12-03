import mongoose from 'mongoose';
import Exam from './Exam';

const CurriculumExamSchema = new mongoose.Schema({});

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
});

export { CurriculumSchema };

const CurriculumExam = CurriculumSchema.path('years.exams');

// TODO: Fix discriminator types
/*
export const CurriculumCompulsoryExam = CurriculumExam.discriminator("CompulsoryExam", new mongoose.Schema(
    {
        exam_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Exam
        }
    }));

export const CurriculumCompulsoryGroup = CurriculumExam.discriminator("CompulsoryGroup", new mongoose.Schema(
    {
        group: String
    }));

export const CurriculumFreeChoiceGroup = CurriculumExam.discriminator("FreeChoiceGroup", new mongoose.Schema(
    {
        group: String
    }));

export const CurriculumFreeChoiceExam = CurriculumExam.discriminator("FreeChoiceExam", new mongoose.Schema(
     {}
));
*/