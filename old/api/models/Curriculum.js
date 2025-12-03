
const mongoose = require('mongoose');
const { CurriculumSchema } = require('./CurriculumExam')

const Curriculum = mongoose.model('Curriculum', CurriculumSchema)

module.exports = Curriculum
