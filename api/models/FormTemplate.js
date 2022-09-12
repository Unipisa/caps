const mongoose = require('mongoose');

const FormTemplateSchema = new mongoose.Schema({
    old_id: {
        type: Number,
        required: false
    },
    name: { 
        type: String, 
        required: true
    },
    text: {
        type: String,
        required: false,
    },
    enabled: {
        type: Boolean,
        required: true
    },
    notify_emails: [String],
})

const FormTemplate = mongoose.model('FormTemplate', FormTemplateSchema)

module.exports = FormTemplate