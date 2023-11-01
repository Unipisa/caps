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
    // non c'è password ma ci sono
    // ci sono hash e salt creati da passport
    // forse non serve neanche nominarli nel modello 
    /*
    hash: {
        type: String
    },
    salt: {
        type: String
    },
    */
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema)

module.exports = User;
