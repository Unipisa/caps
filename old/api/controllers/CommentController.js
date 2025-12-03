const ModelController = require('./ModelController');
const Comment = require('../models/Comment');
const assert = require('assert')
const mongoose = require('mongoose')

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
    "attachments": {
        can_filter: true,
        can_sort: true,
        match_id_object: true
    }
};

const CommentController = {
    index: async req => {
        const query = req.query
        const user = req.user
        assert(user) // l'autenticazione viene controllata dal router

        // se l'utente non è admin possiamo vedere solamente i commenti
        // collegati ad un nostro proposal.
        // la query deve quindi fare un lookup sui proposals

        const restrict = user.admin ? [] : [
            // restrict to comments attached to a Proposal of mine
            {$match: {
                "proposal.user_id": user._id,
            }},
        ]

        const pipeline = ModelController.queryFieldsToPipeline(query, fields)
        const db = mongoose.connection.db
        const comments = db.collection('comments')
        const [res] = await comments.aggregate([
            // lookup sui proposals
            {$lookup: {
                from: "proposals",
                localField: "object_id",
                foreignField: "_id",
                as: "proposal"
            }},
            // flatten dei proposals
            {$unwind: {
                path: "$object_id",
                preserveNullAndEmptyArrays: true
            }},
            {$lookup: {
                from: "attachments",
                localField: "attachments",
                foreignField: "_id",
                as: "attachmentsData",
            }},
            ...restrict,
            ...pipeline,
        ]).toArray()
        console.log(`res: ${JSON.stringify(res)}`)
        res.items.forEach(comment => {
            comment.attachmentsData.forEach(attachment => {
                attachment.signedId = ModelController.signedId(attachment._id.toString())
            })
        })
        return res
    }, 

    post: async req => {
        const data = req.body
        const user = req.user
        assert(user) // l'autenticazione viene controllata dal router
        return await ModelController.post(Comment, {
            ...data,
            creator_id: user._id,
        })
    },

    delete: async req => {
        const { id } = req.params
        const user = req.user
        assert(user) // l'autenticazione viene controllata dal router
        const obj = await Comment.findById(id)
        if (!obj) throw new NotFoundError()
        if (!user.admin && user._id !==obj.creator_id) throw new ForbiddenError()
        return await ModelController.delete(Comment, id)
    }
}

module.exports = CommentController;
