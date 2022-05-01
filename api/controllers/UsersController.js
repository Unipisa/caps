const ModelController = require('./ModelController');
const User = require('../models/User');

const fields = { 
    "username": { 
        can_filter: true, 
        can_sort: true},
    "name": { 
        can_filter: true, 
        can_sort: true},  
    "number": { 
        can_filter: true, 
        can_sort: true}, 
    "givenname": { 
        can_filter: true,
        can_sort: true}, 
    "surname": {
        can_filter: true,
        can_sort: true}, 
    "email": {
        can_filter: true,
        can_sort: true}, 
    "admin": {
        can_filter: true,
        can_sort: true}
    };



const UsersController = {

    index: async req => {
        return await ModelController.index(req, {
            Model: User, fields
        });
    }, 

    post: async req => {
        const exam = new User(req.body);
        return await exam.save();
    }
}

module.exports = UsersController;