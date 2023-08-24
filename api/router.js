let express = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local')

const UnipiAuthStrategy = require('./unipiAuth')
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

const User = require('./models/User')

const router = new express.Router()

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

// local password authentication
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// unipi oauth2 authentication
const env = process.env
if (env.OAUTH2_CLIENT_ID) {
  passport.use(new UnipiAuthStrategy({
    authorizationURL: env.OAUTH2_AUTHORIZE_URL,
    tokenURL: env.OAUTH2_TOKEN_URL,
    clientID: env.OAUTH2_CLIENT_ID,
    clientSecret: env.OAUTH2_CLIENT_SECRET,
    callbackURL: `${env.SERVER_URL}/login/oauth2/callback`,
    usernameField: env.OAUTH2_USERNAME_FIELD,
  }))
} else {
  console.log("OAUTH2 authentication disabled")
  console.log("set OAUTH2_CLIENT_ID to enable")
}

router.post('/login', function(req, res) {
    const user = req.user || null
    res.send({ user })
})
  
router.post('/login/password',
    passport.authenticate('local'),
    function(req, res) {
        console.log("login/password")
        const user = req.user.toObject()
        console.log(`login ${user.username} roles: ${user.roles}`)
        res.send({ user })
})

if (process.env.OAUTH2_CLIENT_ID) {
    router.get('/login/oauth2', passport.authenticate('oauth2'))
}

router.get('/login/oauth2/callback',
    passport.authenticate('oauth2'),
    function(req, res) {
        const user = req.user.toObject()
        console.log(`login ${JSON.stringify(user)}`)
        res.redirect(config.BASE_URL)
    })

router.post('/logout', function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err) }
        // res.redict('/login')
        res.send({ "user": null })
    })
})
  
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
router.get('/attachments', response_envelope(Attachments.index))

// Queste route sono leggermente diverse rispetto alle altre perché si occupano
// di inviare e ricevere file, cosa che va gestita in modo diverso
router.post('/attachments', Attachments.postMiddleware, response_envelope(Attachments.post))
router.get('/attachments/:id/content', Attachments.viewContent)

router.get('/attachments/:id', response_envelope(Attachments.view))
router.get('/comments', response_envelope(Comments.index))
router.post('/comments/delete/:id', response_envelope(Comments.delete))
router.get('/comments/:id', response_envelope(Comments.view))
router.post('/comments', response_envelope(Comments.post))

router.all(/.*/, response_envelope((req) => {throw new NotFoundError()}))

module.exports = router;
