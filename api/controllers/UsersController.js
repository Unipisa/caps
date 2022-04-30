const ModelController = require('./ModelController');
const User = require('../models/User');

const UsersController = {

    index: async req => {
        const common_keys = [
            "username",
            "name", 
            "number",
            "givenname",
            "surname",
            "email",
            "admin", 
        ];

        return await ModelController.index(req, {
            permitted_filter_keys: common_keys,
            permitted_sort_keys: common_keys,
            Model: User,
        });
    }, 

    post: async req => {
        const exam = new User(req.body);
        return await exam.save();
    }
}

module.exports = UsersController;