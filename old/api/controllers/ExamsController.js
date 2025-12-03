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
        const query = req.query
        return await ModelController.index(Exam, query, fields);
    }, 

    view: async req => {
        const { id } = req.params
        return await ModelController.view(Exam, id)
    },

    patch: async req => {
        const { id } = req.params;
        const data = req.body
        return await ModelController.patch(Exam, id, data);
    },

    post: async req => {
        const data = req.body
        return await ModelController.post(Exam, data);
    },

    delete: async req => {
        const { id } = req.params;
        return await ModelController.delete(Exam, id);
    }
}

module.exports = ExamsController;
