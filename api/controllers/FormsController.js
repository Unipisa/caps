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
        return await ModelController.index(req, {
            Model: Form, fields
        });
    }, 

    post: async req => {
        const form = new Form(req.body);
        return await form.save();
    }
}

module.exports = FormsController;