const ModelController = require('./ModelController');
const Proposal = require('../models/Proposal');

const fields = {
    "state": {
        can_filter: true,
    },
    date_managed: {
        can_filter: true,
        can_sort: true,
    },
    date_submitted: {
        can_filter: true,
        can_sort: true,
    },
    date_modified: {
        can_filter: true,
        can_sort: true,
    },    
    "user_id": {
        can_filter: true,
        can_sort: true,
        match_id_object: true,
    },
    "user_last_name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "user_first_name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "user_name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "curriculum_year": {
        can_filter: true,
        can_sort: true 
    },
    "curriculum_name": {
        can_filter: true,
        can_sort: true
    },
    "degree_name": {
        can_filter: true,
        can_sort: true
    }
};

const ProposalsController = {
    index: async req => {
        const query = req.query
        const user = req.user 
        const restrict =  {}
        if (!user) req.status(401).send("unauthorized")
        if (!user.is_admin) {
            restrict.user_id = user._id
        }
        return await ModelController.index(Proposal, query, fields, { restrict });
    }, 

    view: async req => {
        const { id } = req.params
        return await ModelController.view(Proposal, id)
    },

    post: async req => {
        return await ModelController.post(Proposal, req.body)
    },

    delete: async req => {
        const { id } = req.params
        return await ModelController.delete(Proposal, id)
    }
}

module.exports = ProposalsController;
