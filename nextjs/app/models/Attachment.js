const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
    filename: {
        type: String
    },
    mimetype: {
        type: String
    },
    encoding: {
        type: String
    },
    uploader_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'   
    },
    size: {
        type: Number
    },
    content: {
        type: String    // è un id ma NON è un ObjectId di mongo
    }
}, { timestamps: true })
const Attachment = mongoose.model('Attachment', attachmentSchema)

module.exports = Attachment;
