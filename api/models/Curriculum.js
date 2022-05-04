
const mongoose = require('mongoose');

const Curriculum = mongoose.model('Curriculum', {
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
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'CurriculumExam'
                },
            ]
        }
    ]
})

module.exports = Curriculum
