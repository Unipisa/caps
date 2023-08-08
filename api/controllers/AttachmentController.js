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
        // TODO: il contenuto dell'allegato deve essere gestito all'interno
        // di questo metodo, probabilmente utlizzando il middleware `multer`
        // per express, modificando poi il body all'occorrenza
        const attachment = new Attachment(req.body);
        return await attachment.save();
    }
}

module.exports = AttachmentController;
