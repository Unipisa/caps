let express = require('express')
const passport = require('passport')

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
const UserController = require('./controllers/UsersController')
const settingsController = require('./controllers/SettingsController')

const router = new express.Router()

// JSON parsing middleware
router.use(express.json())

function response_envelope(controller) {
    return async function(req, res, next) {
        try {   
            const data = await controller(req);
            res.json(data)
        } catch(e) {
            next(e);
        }
    }
}

function require_user(req, res, next) { 
    if (!req.user) return res.status(401).send("unauthorized")
    next()
}

function require_admin(req, res, next) {
    if (!req.user) return res.status(401).send("unauthorized")
    if (!req.user.admin) return res.status(403).send("forbidden")
    next()
}

function require_admin_or_self(req, res, next) {
    if (!req.user) return res.status(401).send("unauthorized")
    if (!req.user.admin && req.user._id != req.params.id) return res.status(403).send("forbidden")
    next()
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
    callbackURL: `${env.SERVER_URL}/api/v0/login/oauth2/callback`,
    usernameField: env.OAUTH2_USERNAME_FIELD,
  }))
  console.log("OAUTH2 authentication enabled")
  console.log(`OAUTH2_AUTHORIZE_URL: ${env.OAUTH2_AUTHORIZE_URL}`)
  console.log(`OAUTH2_CLIENT_ID: ${env.OAUTH2_CLIENT_ID}`)
  console.log(`SERVER_URL: ${env.SERVER_URL}`)
} else {
  console.log("OAUTH2 authentication disabled")
  console.log("set OAUTH2_CLIENT_ID to enable")
}

router.get('/hello', function(req, res) {
    console.log(`hello ${JSON.stringify(req.body)}`)
    res.send({ hello: "hello!" })
})

router.post('/login', function(req, res) {
    const user = req.user || null
    res.send({ user })
})
  
async function loginController(req) {
    const user = req.user.toObject()
    console.log(`login/password: ${user.username}`)

    // return user as if it was fetched from /users/:id
    const gotUser = await UserController.view({params: {id: `${user._id}`}})
    return {user: gotUser}
}

router.post('/login/password',
    passport.authenticate('local'),
    response_envelope(loginController))

if (process.env.OAUTH2_CLIENT_ID) {
    router.get('/login/oauth2', 
        passport.authenticate('oauth2'))
}

router.get('/login/oauth2/callback',
    passport.authenticate('oauth2'),
    function(req, res) {
        console.log("OAUTH2 authentication callback")
        const user = req.user.toObject()
        console.log(`login ${JSON.stringify(user)}`)
        res.redirect(process.env.SERVER_URL)
    })

router.post('/logout', function(req, res) {
    console.log("CALLING LOGOUT")
    req.logout(function(err) {
        console.log("CALLED LOGOUT")
        if (err) { return next(err) }
        res.send({ user: null })
    })
})
  
router.get('/', response_envelope(req => "Hello there!"))

router.get('/proposals', require_user, response_envelope(Proposals.index))
router.get('/proposals/:id', require_user, response_envelope(Proposals.view))
router.post('/proposals', require_user, response_envelope(Proposals.post))
router.delete('/proposals/:id', require_user, response_envelope(Proposals.delete))    

router.get('/forms', require_user, response_envelope(Forms.index))
router.get('/forms/:id', require_user, response_envelope(Forms.view))

router.get('/degrees', require_user, response_envelope(Degrees.index))
router.get('/degrees/:id', require_user, response_envelope(Degrees.view))
router.post('/degrees', require_admin, response_envelope(Degrees.post))

router.get('/curricula', require_user, response_envelope(Curricula.index))
router.get('/curricula/:id', require_user, response_envelope(Curricula.view))

router.get('/form_templates/', require_admin, response_envelope(FormTemplates.index))
router.get('/form_templates/:id', require_admin, response_envelope(FormTemplates.view))
router.post('/form_templates', require_admin, response_envelope(FormTemplates.post))
router.patch('/form_templates/:id', require_admin, response_envelope(FormTemplates.patch))

router.get('/exams/:id', require_user, response_envelope(Exams.view))
router.get('/exams', require_user, response_envelope(Exams.index))
router.post('/exams', require_admin, response_envelope(Exams.post))
router.patch('/exams/:id', require_admin, response_envelope(Exams.patch))
router.delete('/exams/:id', require_admin, response_envelope(Exams.delete))

router.get('/users/:id', require_admin_or_self, response_envelope(Users.view))
router.get('/users', require_admin, response_envelope(Users.index))
router.post('/users', require_admin, response_envelope(Users.post))
router.patch('/users/:id', require_admin, response_envelope(Users.patch))


router.get('/attachments/:signedId/content', require_user, Attachments.viewContent)
router.get('/attachments/:signedId', require_user, response_envelope(Attachments.view))
router.post('/attachments', require_user, Attachments.postMiddleware, response_envelope(Attachments.post))

router.get('/comments', require_user, response_envelope(Comments.index))
router.post('/comments', require_user, response_envelope(Comments.post))
router.delete('/comments/:id', require_user, response_envelope(Comments.delete))

router.get('/settings', require_admin, response_envelope(settingsController))
router.post('/settings', require_admin, response_envelope(settingsController))

router.all(/.*/, response_envelope((req) => {throw new NotFoundError()}))

module.exports = router;
