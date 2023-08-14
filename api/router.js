let express = require('express')
const multer  = require('multer')
let router = new express.Router()
const path = require('path')
const { BadRequestError, ValidationError, NotFoundError } = require('./exceptions/ApiException')
const Exams  = require('./controllers/ExamsController')
const Users  = require('./controllers/UsersController')
const Degrees = require('./controllers/DegreesController')
const Curricula = require('./controllers/CurriculaController')
const FormTemplates = require('./controllers/FormTemplates')
const Forms = require('./controllers/FormsController')
const Proposals = require('./controllers/ProposalsController')
const Attachments = require('./controllers/AttachmentController')
const Comments = require('./controllers/CommentController')

// JSON parsing middleware
router.use(express.json())

function response_envelope(controller) {
    return async function(req, res, next) {
        try {   
            const data = await controller(req);
            res.json({
                code: 200,
                message: 'OK',
                data: data
            })
        } catch(e) {
            next(e);
        }
    }
}

function test_error(req, res) {
    throw new BadRequestError("fake error!");
}

const attachmentsDB = path.join(__dirname, '../attachments-db')
const attachmentHandler = multer({ 
    dest: attachmentsDB,
    limits: { 
        fileSize: 20 * 1000 * 1000 // 20MB
    }
}).any()

function attachmentPost(req, res, next) {
    attachmentHandler(req, res, (err) => {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
            next(new ValidationError({ message: 'Gli allegati possono avere come dimensione massima 20MB', location: err.field}))
        } else if (err) {
            next(err)
        } else {
            response_envelope(Attachments.post)(req, res, next)
        }
    })
}
async function attachmentGetContent(req, res, next) {
    try {
        const attachment = await Attachments.view(req)
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
    } catch(e) {
        next(e)
    }

}

router.get('/', response_envelope(req => "Hello there!"))
router.get('/proposals', response_envelope(Proposals.index))
router.get('/proposals/:id', response_envelope(Proposals.view))
router.get('/forms', response_envelope(Forms.index))
router.get('/forms/:id', response_envelope(Forms.view))
router.get('/degrees', response_envelope(Degrees.index))
router.get('/degrees/:id', response_envelope(Degrees.view))
router.post('/degrees', response_envelope(Degrees.post))
router.get('/curricula', response_envelope(Curricula.index))
router.get('/curricula/:id', response_envelope(Curricula.view))
router.get('/form_templates/', response_envelope(FormTemplates.index))
router.get('/form_templates/:id', response_envelope(FormTemplates.view))
router.post('/exams/delete/:id', response_envelope(Exams.delete))
router.get('/exams/:id', response_envelope(Exams.view))
router.post('/exams/:id', response_envelope(Exams.update))
router.get('/exams', response_envelope(Exams.index))
router.post('/exams', response_envelope(Exams.insert))
router.get('/users', response_envelope(Users.index))
router.get('/users/:id', response_envelope(Users.view))
router.post('/users', response_envelope(Users.post))
router.get('/comments', response_envelope(Comments.index))
router.get('/comments/:id', response_envelope(Comments.view))
router.post('/comments', response_envelope(Comments.post))
router.get('/attachments', response_envelope(Attachments.index))
router.get('/attachments/:id', response_envelope(Attachments.view))
router.get('/attachments/:id/content', attachmentGetContent)
router.post('/attachments', attachmentPost)

router.all(/.*/, response_envelope((req) => {throw new NotFoundError()}))

module.exports = router;
