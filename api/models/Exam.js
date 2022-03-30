
const mongoose = require('mongoose');

const Exam = mongoose.model('Exam', {
    name: { 
        type: String, 
        required: true
    },
    code: { 
        type: String,
        default: null
    },
    sector: { 
        type: String,
        default: ""
    },
    credits: {
        type: Number,
        required: true
    }
})

module.exports = Exam;