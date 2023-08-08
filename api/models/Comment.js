const mongoose = require('mongoose');

const Comment = mongoose.model('Comment', {
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
})

module.exports = Comment;
