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
    }};

const ExamsController = {

    index: async req => {
        return await ModelController.index(req, {
            fields,
            Model: Exam,
        });
    }, 

    post: async req => {
        const exam = new Exam(req.body);
        return await exam.save();
    }
}

module.exports = ExamsController;