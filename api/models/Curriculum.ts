
import mongoose from 'mongoose'
import { CurriculumSchema } from './CurriculumExam'

const Curriculum = mongoose.model('Curriculum', CurriculumSchema)

export default Curriculum