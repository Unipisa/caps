const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    old_id: {
        type: Number,
        required: false
    },
    field: {
        type: String, 
        required: true
    },
    value: {
        type: String, 
        required: true
    },
    fieldType: {
        type: String,
        required: true
    },    
})

const Settings = mongoose.model('Settings', settingsSchema)

module.exports = Settings
