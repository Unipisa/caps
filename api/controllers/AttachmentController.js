const fs = require('fs');
const path = require('path')
const multer = require('multer')

const { ValidationError } = require('../exceptions/ApiException')

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


const attachmentsDB = process.env.ATTACHMENTS_PATH || path.join(__dirname, '..', '..', 'attachments-db')
const attachmentHandler = multer({
    dest: attachmentsDB,
    limits: {
        fileSize: 20 * 1000 * 1000 // 20MB
    }
}).any()

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

    viewContent: async (req, res, next) => {
        try {
            const attachment = await AttachmentController.view(req)
            const filepath = path.join(attachmentsDB, attachment.content)

            // TODO: metti verifia che l'utente abbia effettivamente accesso a questo file
            res.sendFile(filepath, {
                headers: {
                    'Content-Type': attachment.mimetype,
                    'Content-Disposition': `attachment; filename="${attachment.filename}"`
                }
            }, (err) => {
                if (err) {
                    next(err)
                }
            })
        } catch (e) {
            next(e)
        }
    },

    postMiddleware: async (req, res, next) => {
        attachmentHandler(req, res, (e) => {
            if (e instanceof multer.MulterError && e.code === "LIMIT_FILE_SIZE") {
                next(new ValidationError(e.field, 'Gli allegati possono avere come dimensione massima 20MB'))
            } else {
                next(e);
            }
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
    },

    delete: async req => {
        const { id } = req.params
        const attachment = await ModelController.view(req, { Model: Attachment })
        fs.unlinkSync(path.join(attachmentsDB, attachment.content))
        return await ModelController.delete(Attachment, id)
    }
}

module.exports = AttachmentController;
