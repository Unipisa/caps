const mongoose = require('mongoose');

const User = mongoose.model('User', {
    username: {
        type: String, 
        required: true
    },
    name: {
        type: String
    }, 
    number: {
        type: String
    },
    givenname: {
        type: String
    },
    surname: {
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