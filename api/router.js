var express = require('express');
var router = express.Router();

const ApiController = require('./controllers/ApiController');
const ExamsController = require('./controllers/ExamsController');

// JSON parsing middleware
router.use(express.json())

router.get('/', ApiController.index);

// Exams routes
router.get('/exams', ExamsController.index);
router.post('/exams', ExamsController.post);

module.exports = router;