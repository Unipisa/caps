const { default: mongoose } = require("mongoose");
const ModelController = require('./ModelController');
const Attachment = require('../models/Attachment');

const fields = {
    "mimetype": {
        can_filter: true,
    }, 
    "uploader_id": {
        can_filter: true,
        can_sort: true,
        match_id_object: true,
    },
    "size": {
        can_filter: true,
        can_sort: true 
    },
};

const AttachmentController = {

    index: async req => {
        return await ModelController.index(req, {
            Model: Attachment,
            fields
        });
    }, 

    view: async req => {
        return await ModelController.view(req, {
            Model: Attachment,
            fields
        })
    },

    post: async req => {
        let reply = []
        for (const file of req.files) {
            const attachment_id = await ModelController.insert(Attachment, {
                filename: file.originalname,
                mimetype: file.mimetype,
                encoding: file.encoding,
                size: file.size,
                content: file.filename,
                uploader_id: req.body.uploader_id
            })
            reply.push(attachment_id)
        }
        return reply
    }
}

module.exports = AttachmentController;
