
const mongoose = require('mongoose');

const Group = mongoose.model('Group', {
    old_id: {
        type: Number,
        required: false
    },
    degree: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Degree'
    },
    name: { 
        type: String, 
        required: true
    },
    exams: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam'    
        }
    ]
})

module.exports = Group;