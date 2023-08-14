const mongoose = require('mongoose');

const Attachment = mongoose.model('Attachment', {
    filename: {
        type: String
    },
    mimetype: {
        type: String
    },
    uploader_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'   
    },
    size: {
        type: String
    },
    content: {
        type: String
    }
})

module.exports = Attachment;
