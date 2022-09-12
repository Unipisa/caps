
const mongoose = require('mongoose');

const Form = mongoose.model('Form', {
    old_id: {
        type: Number,
        required: false
    },
    form_template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FormTemplate'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'   
    },
    state: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'rejected'],
    }, 
    date_submitted: {
        type: Date,
    },
    date_managed: {
        type: Date,
    },
    data: {
        type: Map,
        of: String
    }
})

module.exports = Form;