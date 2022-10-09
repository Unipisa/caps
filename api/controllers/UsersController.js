const ModelController = require('./ModelController')
const User = require('../models/User')

const fields = { 
    "username": { 
        can_filter: true, 
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    },
    "name": { 
        can_filter: true, 
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    },  
    "id_number": { 
        can_filter: true, 
        can_sort: true
    }, 
    "first_name": { 
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "last_name": {
        can_filter: true,
        can_sort: true, 
        match_regex: q => new RegExp(q, "i")
    }, 
    "email": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "admin": {
        can_filter: true,
        can_sort: true
    }
}

const UsersController = {

    index: async req => {
        return await ModelController.index(req, {
            Model: User, fields
        });
    }, 

    view: async req => {
        return await ModelController.view(req, {
            Model: User, fields
        })
    },

    post: async req => {
        const item = new User(req.body);
        return await item.save();
    }
}

module.exports = UsersController;