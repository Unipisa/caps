const { model_index_data, get_data, post_data } = require('./ApiController');
const Exam = require('../models/Exam');
const { BadRequestError } = require('../exceptions/ApiException');

exports.exams_index_data = async req => {
    const common_keys = [
        "name", 
        "code", 
        "sector", 
        "credits",
    ];
    return await model_index_data(req, {
        permitted_filter_keys: common_keys,
        permitted_sort_keys: common_keys,
        Model: Exam,
    });
}

exports.exam_post_data = async req => {
    const exam = new Exam(req.body);
    return await exam.save();
}
