let express = require('express');
let router = new express.Router();

const Exams  = require('./controllers/ExamsController');
const { BadRequestError } = require('./exceptions/ApiException');

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
router.get('/error', test_error);
router.get('/exams', response_envelope(Exams.index));
router.post('/exams', response_envelope(Exams.post));

module.exports = router;