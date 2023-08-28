const ModelController = require('./ModelController');
const Curriculum = require('../models/Curriculum');

const fields = {
    "name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "academic_year": {
        can_filter: true,
        can_sort: true 
    },
    "degree.name": {
        can_filter: true,
        can_sort: true
    }
};

const CurriculaController = {

    index: async req => {
        const query = req.query
        return await ModelController.index(Curriculum, query, fields);
    }, 

    view: async req => {
        const { id } = req.params
        return await ModelController.view(Curriculum, id)
    },

    post: async req => {
        const curriculum = new Curriculum(req.body);
        return await curriculum.save();
    }
}

module.exports = CurriculaController;
