const ModelController = require('./ModelController')
const User = require('../models/User')
const { ForbiddenError, BadRequestError } = require('../exceptions/ApiException')
const assert = require('assert')

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
        can_sort: true,
        match_boolean: true,
    }
}

const UsersController = {
    index: async req => {
        const query = req.query
        const pipeline = ModelController.queryFieldsToPipeline(query, fields)
        const [res] = await User.aggregate([
            ...pipeline,
        ])
        return res
    }, 

    view: async req => {
        const { id } = req.params
        return await ModelController.view(User, id)
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
