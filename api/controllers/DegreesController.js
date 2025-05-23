const ModelController = require('./ModelController');
const Degree = require('../models/Degree');

const fields = {
    "name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "academic_year": {
        can_filter: true,
        can_sort: true}, 
    "years": {
        can_filter: true,
        can_sort: true}, 
    "enable": {
        can_filter: true,
        can_sort: true
    }};

const DegreesController = {

    index: async req => {
        const user = req.user
        const query = req.query
        const pipeline = ModelController.queryFieldsToPipeline(query, fields)

        const restrict = user.is_admin ? [] : [
            // remove disabled degrees
            {$match: {
                "enabled": true
            }},
        ]

        const [ res ] = await Degree.aggregate([
            ...restrict,
            ...pipeline,
        ])

        return res
    }, 

    view: async req => {
        const { id } = req.params
        return await ModelController.view(Degree, id, {toObject})

        function toObject(degree) {
            return {
                ...degree.toObject(),
                groups: Object.fromEntries(degree.groups.entries())
            }
        }
    },

    post: async req => {
        return await ModelController.post(Degree, req.body)
    }
}

module.exports = DegreesController;
