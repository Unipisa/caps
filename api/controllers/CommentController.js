const ModelController = require('./ModelController');
const Comment = require('../models/Comment');

const fields = {
    "object_id": {
        can_filter: true,
        can_sort: true,
        match_id_object: true,
    },
    "creator_id": {
        can_filter: true,
        can_sort: true,
        match_id_object: true,
    },
    "modifier_id": {
        can_filter: true,
        can_sort: true,
        match_id_object: true,
    },
    "attachments": {
        can_filter: true,
        can_sort: true,
        match_id_object: true
    }
};

const CommentController = {

    index: async req => {
        const query = req.query
        return await ModelController.index(Comment, query, fields, { populate: 'attachments creator_id' });
    }, 

    view: async req => {
        const { id } = req.params
        return await ModelController.view(Comment, id)
    },

    post: async req => {
        const data = req.body
        return await ModelController.post(Comment, data)
    },

    delete: async req => {
        const { id } = req.params;
        return await ModelController.delete(Comment, id);
    }
}

module.exports = CommentController;
