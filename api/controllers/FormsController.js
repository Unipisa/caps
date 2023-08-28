const ModelController = require('./ModelController')
const Form = require('../models/Form')

const fields = {
    date_managed: {
        can_filter: true,
        can_sort: true,
    },
    date_submitted: {
        can_filter: true,
        can_sort: true,
    },
    "user.name": {
        can_filter: true,
        can_sort: true,
    },
    "form_template.name": {
        can_filter: true,
        can_sort: true,
    }
}

const FormsController = {
    index: async req => {
        const query = req.query
        return await ModelController.index(Form, query, fields);
    }, 

    view: async req => {
        const { id } = req.params
        return await ModelController.view(Form, id)
    },

    post: async req => {
        const form = new Form(req.body);
        return await form.save();
    }
}

module.exports = FormsController;
