
const mongoose = require('mongoose');

const Form = mongoose.model('Form', {
    old_id: {
        type: Number,
        required: false
    },
    form_template_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FormTemplate'
    },
    form_template_name: {
        type: String,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'   
    },
    user_last_name: {
        type: String,
    },
    user_first_name: {
        type: String,
    },
    user_id_number: {
        type: String,
    },
    user_email: {
        type: String,
    },
    user_username: {
        type: String,
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