const ModelController = require('./ModelController');
const Exam = require('../models/Exam');
const { BadRequestError } = require('../exceptions/ApiException');

const ExamsController = {

    index: async req => {
        const common_keys = [
            "name", 
            "code", 
            "sector", 
            "credits",
        ];

        return await ModelController.index(req, {
            permitted_filter_keys: common_keys,
            permitted_sort_keys: common_keys,
            Model: Exam,
        });
    }, 

    post: async req => {
        const exam = new Exam(req.body);
        return await exam.save();
    }
}

module.exports = ExamsController;