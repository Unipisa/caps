const ModelController = require('./ModelController');
const Exam = require('../models/Exam');

const fields = {
    "name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "code": {
        can_filter: true,
        can_sort: true}, 
    "sector": {
        can_filter: true,
        can_sort: true}, 
    "credits": {
        can_filter: true,
        can_sort: true,
        match_integer: true
    },
    "ids": {
        can_filter: true,
        can_sort: false,
        match_ids: true
    }
};

const ExamsController = {

    index: async req => {
        return await ModelController.index(req, {
            Model: Exam,
            fields
        });
    }, 

    view: async req => {
        return await ModelController.view(req, {
            Model: Exam,
            fields
        })
    },

    update: async req => {
        const { id } = req.params;
        // Some pre-processing might be needed here on req.body
        // for tags (eg remove duplicate etc)
        return await ModelController.update(Exam, id, req.body);
    },

    insert: async req => {
        return await ModelController.insert(Exam, req.body);
    },

    delete: async req => {
        const { id } = req.params;
        return await ModelController.delete(Exam, id);
    }
}

module.exports = ExamsController;
