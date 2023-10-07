const ModelController = require('./ModelController');
const FormTemplate = require('../models/FormTemplate');

const fields = {
    "name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "enabled": {
        can_filter: true,
        can_sort: true,
        match_boolean: true,
    }
};

const FormTemplatesController = {

    index: async req => {
        const query = req.query
        return await ModelController.index(FormTemplate, query, fields);
    }, 

    view: async req => {
        const { id } = req.params
        return await ModelController.view(FormTemplate, id)
    },

    post: async req => {
        return await ModelController.post(FormTemplate, req.body)
    }
}

module.exports = FormTemplatesController;
