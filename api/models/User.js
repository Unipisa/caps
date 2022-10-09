const mongoose = require('mongoose');

const User = mongoose.model('User', {
    old_id: {
        type: Number,
        required: false
    },
    username: {
        type: String, 
        required: true
    },
    name: {
        type: String
    }, 
    id_number: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    admin: {
        type: Boolean,
        required: true, 
        default: false
    }, 
    password: {
        type: String
    }
})

module.exports = User;