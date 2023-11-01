import mongoose, { Schema } from 'mongoose'
import { required, isNotEmpty, minVal } from './Validators'

const Exam = mongoose.model('Exam', new Schema({
    old_id: {
        type: Number,
        required: false
    },
    name: {
        type: String,
        required: required("Nome"),
        validate: [isNotEmpty("Nome")]
    },
    code: {
        type: String,
        default: "",
        // required: required("Codice"),
        // validate: [isNotEmpty("Codice")]
    },
    sector: {
        type: String,
        required: required("Settore"),
        validate: [isNotEmpty("Settore")]
    },
    credits: {
        type: Number,
        required: required("Crediti"),
        validate: [minVal(1, "Crediti")]
    },
    tags: {
        type: [String],
        default: []
    },
    notes: {
        type: String,
        default: ""
    },
}))

export default Exam