
const mongoose = require('mongoose');

const Degree = mongoose.model('Degree', {
    old_id: {
        type: Number,
        required: false
    },
    name: { 
        type: String, 
        required: true
    },
    academic_year: { 
        type: Number,
        required: true
    },
    years: {
        type: Number,
        required: true,
        default: 3
    },
    enabled: {
        type: Boolean,
        required: true,
        default: false
    },
    enable_sharing: {
        type: Boolean,
        required: true,
        default: true
    },
    approval_confirmation: {
        type: Boolean,
        required: true,
        default: true
    },
    rejection_confirmation: {
        type: Boolean,
        required: true,
        default: true
    },
    submission_confirmation: {
        type: Boolean,
        required: true,
        default: true
    },
    approval_message: {
        type: String,
        required: false,
        default: ""
    },
    rejection_message: {
        type: String,
        required: false,
        default: ""
    },
    submission_message: {
        type: String,
        required: false,
        default: ""
    },
    free_choice_message: {
        type: String,
        required: false,
        default: ""
    },
})

module.exports = Degree;