const ModelController = require('./ModelController');
const Degree = require('../models/Degree');

const fields = {
    "name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "academic_year": {
        can_filter: true,
        can_sort: true}, 
    "years": {
        can_filter: true,
        can_sort: true}, 
    "enable": {
        can_filter: true,
        can_sort: true
    }};

const DegreesController = {

    index: async req => {
        const query = req.query
        return await ModelController.index(Degree, query, fields);
    }, 

    view: async req => {
        const { id } = req.params
        return await ModelController.view(Degree, id)
    },

    post: async req => {
        return await ModelController.post(Degree, req.body)
    }
}

module.exports = DegreesController;
