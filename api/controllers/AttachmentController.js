const fs = require('fs');
const path = require('path')
const multer = require('multer')
const assert = require('assert')

const { ValidationError, ForbiddenError, NotFoundError } = require('../exceptions/ApiException')

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

    view: async req => {
        const { id } = req.params
        const user = req.user
        const obj = await ModelController.view(Attachment, id)

        if (!user.admin && obj.uploader_id !== user._id) throw new ForbiddenError()
        
        return obj
    },

    viewContent: async (req, res, next) => {
        try {
            // AttachmentController.view controlla che l'utente sia autorizzato
            const attachment = await AttachmentController.view(req)
            const filepath = path.join(attachmentsDB, attachment.content)

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
        const user = req.user
        assert(user) // l'autenticazione viene controllata dal router

        let reply = []
        for (const file of req.files) {
            const data = {
                filename: file.originalname,
                mimetype: file.mimetype,
                encoding: file.encoding,
                size: file.size,
                content: file.filename,
                uploader_id: user._id,
            }
            const attachment_id = await ModelController.post(Attachment, data)
            reply.push(attachment_id)
        }
        return reply
    },

    delete: async req => {
        const { id } = req.params
        const user = req.user
        assert(user) // l'autenticazione viene controllata dal router

        // se AttachmentController.view non solleva eccezioni, l'utente è autorizzato
        const attachment = await AttachmentController.view(req, { Model: Attachment })
        fs.unlinkSync(path.join(attachmentsDB, attachment.content))
        return await ModelController.delete(Attachment, id)
    }
}

module.exports = AttachmentController;
