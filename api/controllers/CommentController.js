const ModelController = require('./ModelController');
const Comment = require('../models/Comment');

const { BadRequestError } = require('../exceptions/ApiException');
const AttachmentController = require('./AttachmentController');

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
    "attachments": {
        can_filter: true,
        can_sort: true,
        match_id_object: true
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
    },

    delete: async req => {
        const { id } = req.params;
        try {
            const comment = await ModelController.view(req, { Model: Comment })
            for (const attachment_id of comment.attachments) {
                const attachmentOccurrence = await ModelController.index({ query: { attachments: attachment_id }}, {
                    Model: Comment,
                    fields
                })
                if (attachmentOccurrence.total === 1) {
                    await AttachmentController.delete({ params: { id: attachment_id }})
                }
            }
        } catch(e) {
            throw new BadRequestError(e)
        }
        return await ModelController.delete(Comment, id);
    }
}

module.exports = CommentController;
