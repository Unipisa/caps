const ApiController = require('./ApiController');
const Exam = require('../models/Exam');

class ExamsController extends ApiController {

    static async index(req, res) {
        const exams = await Exam.find();
        ExamsController.JSONResponse(res, exams);
    }

    static async post(req, res) {
        const exam = new Exam(req.body);

        try {
            await exam.save();
        }
        catch {
            ExamsController.errorResponse(res, 'Database failure while saving the exam');
        }

        ExamsController.JSONResponse(res)
    }

}

module.exports = ExamsController;