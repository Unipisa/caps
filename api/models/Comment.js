const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'   
    },
    modifier_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'   
    },
    content: {
        type: String
    },
    attachments: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }
    ]
}, { timestamps: true })
const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment;
