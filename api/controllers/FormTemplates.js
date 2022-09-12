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
    }
};

const FormTemplatesController = {

    index: async req => {
        return await ModelController.index(req, {
            Model: FormTemplate,
            fields
        });
    }, 

    view: async req => {
        return await ModelController.view(req, {
            Model: FormTemplate,
            fields
        })
    },

    post: async req => {
        const form_template = new FormTemplate(req.body);
        return await form_template.save();
    }
}

module.exports = FormTemplatesController;