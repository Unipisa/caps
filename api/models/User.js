const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
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

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema)

module.exports = User;