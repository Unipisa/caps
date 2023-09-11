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
        const query = req.query
        return await ModelController.index(User, query, fields);
    }, 

    view: async req => {
        const { id } = req.params
        return await ModelController.view(User, id, { populate: { path: 'comments', populate: { path: 'attachments creator_id' } } })
    },

    patch: async req => {
        const { id } = req.params
        const data = req.body
        return await ModelController.patch(User, id, data)    },

    post: async req => {
        const data = req.body
        return await ModelController.post(User, data)
    }
}

module.exports = UsersController;
