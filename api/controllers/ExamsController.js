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

    // post: async req => {
    //     const exam = new Exam(req.body);
    //     return await exam.save();
    // },

    update: async req => {
        const { id } = req.params;
        return await ModelController.update(id, Exam, req.body);
    },

    insert: async req => {
        return await ModelController.insert(Exam, req.body);
    }
}

module.exports = ExamsController;
