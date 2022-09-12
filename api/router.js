let express = require('express')
let router = new express.Router()
const { BadRequestError, NotFoundError } = require('./exceptions/ApiException')
const Exams  = require('./controllers/ExamsController')
const Users  = require('./controllers/UsersController')
const Degrees = require('./controllers/DegreesController')
const Curricula = require('./controllers/CurriculaController')
const FormTemplates = require('./controllers/FormTemplates')
const Forms = require('./controllers/FormsController')

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

router.get('/', response_envelope(req => "Hello there!"));

// Exams routes
router.get('/error', test_error)
router.get('/forms', response_envelope(Forms.index))
router.get('/forms/:id', response_envelope(Forms.view))
router.get('/degrees', response_envelope(Degrees.index))
router.get('/degrees/:id', response_envelope(Degrees.view))
router.post('/degrees', response_envelope(Degrees.post))
router.get('/curricula', response_envelope(Curricula.index))
router.get('/curricula/:id', response_envelope(Curricula.view))
router.get('/form_templates/', response_envelope(FormTemplates.index))
router.get('/form_templates/:id', response_envelope(FormTemplates.view))
router.get('/exams/:id', response_envelope(Exams.view))
router.get('/exams', response_envelope(Exams.index))
router.post('/exams', response_envelope(Exams.post))
router.get('/users', response_envelope(Users.index))
router.post('/users', response_envelope(Users.post))

router.all(/.*/, response_envelope((req) => {throw new NotFoundError()}))

module.exports = router;