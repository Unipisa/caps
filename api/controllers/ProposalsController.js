const ModelController = require('./ModelController');
const Proposal = require('../models/Proposal');

const fields = {
    "state": {
        can_filter: true,
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
    "curriculum_year": {
        can_filter: true,
        can_sort: true 
    },
    "degree_name": {
        can_filter: true,
        can_sort: true
    }
};

const CurriculaController = {

    index: async req => {
        return await ModelController.index(req, {
            Model: Curriculum,
            fields
        });
    }, 

    view: async req => {
        return await ModelController.view(req, {
            Model: Curriculum,
            fields
        })
    },

    post: async req => {
        const curriculum = new Curriculum(req.body);
        return await curriculum.save();
    }
}

module.exports = CurriculaController;