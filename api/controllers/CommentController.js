const ModelController = require('./ModelController');
const Comment = require('../models/Comment');

const fields = {
    "creator_id": {
        can_filter: true,
        can_sort: true,
        match_id_object: true,
    },
    "modifier_id": {
        can_filter: true,
        can_sort: true,
        match_id_object: true,
    } 
};

const CommentController = {

    index: async req => {
        return await ModelController.index(req, {
            Model: Comment,
            fields,
            populate: 'attachments creator_id'
        });
    }, 

    view: async req => {
        return await ModelController.view(req, {
            Model: Comment,
            fields
        })
    },

    post: async req => {
        return await ModelController.insert(Comment, req.body)
    }
}

module.exports = CommentController;
