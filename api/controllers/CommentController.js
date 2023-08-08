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

const CommentController = {

    index: async req => {
        return await ModelController.index(req, {
            Model: Comment,
            fields
        });
    }, 

    view: async req => {
        return await ModelController.view(req, {
            Model: Comment,
            fields
        })
    },

    post: async req => {
        const comment = new Comment(req.body);
        return await comment.save();
    }
}

module.exports = CommentController;
