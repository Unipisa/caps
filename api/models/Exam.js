
const mongoose = require('mongoose');

const Exam = mongoose.model('Exam', {
    old_id: {
        type: Number,
        required: false
    },
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
    },
    tags: [ String ]
})

module.exports = Exam;