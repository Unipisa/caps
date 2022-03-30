
const mongoose = require('./database');

const Exam = mongoose.model('Exam', {
    name: { 
        type: String, 
        required: true
    },
    code: { 
        type: String,
        required: true
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