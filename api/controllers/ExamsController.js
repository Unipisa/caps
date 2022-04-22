const ApiController = require('./ApiController');
const Exam = require('../models/Exam');
const { BadRequestError } = require('../exceptions/ApiException');

class ExamsController extends ApiController {
    static async index(req) {
        // TODO: spostare nella classe base
        const filter = {};
        const sort = {};
        let direction = 1;
        const permitted_filter_keys = [
            "name", 
            "code", 
            "sector", 
            "credits",
        ];
        const permitted_sort_keys = permitted_filter_keys;

        permitted_filter_keys.forEach(key => {
            if (req.query[key]) {
                filter[key] = req.query[key];
            }
        });

        if (req.query._direction) {
            if (req.query._direction === "asc") {
                direction = 1;
            } else if (req.query._direction === "desc") {
                direction = -1;
            } else {
                throw new BadRequestError(`invalid _direction ${req.query._direction}`);
            }
        }

        if (req.query._sort) {
            if (permitted_sort_keys.includes(req.query._sort)) {
                sort[req.query._sort] = direction;
            } else {
                throw new BadRequestError(`invalid _sort ${ req.query._sort }. Valid values are: ${ permitted_sort_keys }`);
            }
        }

        const exams = await Exam.find(filter).sort();
  
        return exams;
    }

    static async post(req) {
        const exam = new Exam(req.body);
        return await exam.save();
    }
}

module.exports = ExamsController;