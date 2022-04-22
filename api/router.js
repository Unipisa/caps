var express = require('express');
var router = express.Router();

const ApiController = require('./controllers/ApiController');
const ExamsController = require('./controllers/ExamsController');
const { BadRequestError } = require('./exceptions/ApiException');

// JSON parsing middleware
router.use(express.json())

router.get('/', ApiController.index);

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

// Exams routes
router.get('/error', test_error);
router.get('/exams', response_envelope(ExamsController.index));
router.post('/exams', response_envelope(ExamsController.post));

module.exports = router;