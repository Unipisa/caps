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
        return await ModelController.index(req, {
            Model: Degree,
            fields
        });
    }, 

    view: async req => {
        return await ModelController.view(req, {
            Model: Degree,
            fields
        })
    },

    post: async req => {
        const degree = new Degree(req.body);
        return await degree.save();
    }
}

module.exports = DegreesController;