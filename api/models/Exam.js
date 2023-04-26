const mongoose = require('mongoose');
const { required, isNotEmpty, minVal } = require('./Validators')

const Exam = mongoose.model('Exam', {
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
})

module.exports = Exam;
