
const mongoose = require('mongoose');
const Exam = require('./Exam')

const options = { discriminatorKey: 'kind' };

const CurriculumExam = mongoose.model("CurriculumExam", 
    new mongoose.Schema({ }, options));

exports.CurriculumExam = CurriculumExam;

const CurriculumCompulsoryExam = CurriculumExam.discriminator("CompulsoryExam", new mongoose.Schema(
    {
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Exam
        }
    }, options))

const CurriculumCompulsoryGroup = CurriculumExam.discriminator("CompulsoryGroup", new mongoose.Schema(
    {
        group: String
    }, options))

const CurriculumFreeChoiceGroup = CurriculumExam.discriminator("FreeChoiceExam", new mongoose.Schema(
    {
        group: String        
    }, options))
    
exports.CurriculumCompulsoryExam = CurriculumCompulsoryExam
exports.CurriculumCompulsoryGroup = CurriculumCompulsoryGroup
exports.CurriculumFreeChoiceGroup = CurriculumFreeChoiceGroup
