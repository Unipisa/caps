const ModelController = require('./ModelController');
const Curriculum = require('../models/Curriculum');

const fields = {
    "name": {
        can_filter: true,
        can_sort: true,
        match_regex: q => new RegExp(q, "i")
    }, 
    "degree_id": {
        can_filter: true,
        can_sort: true,
        match_id_object: true,
    },
    "academic_year": {
        can_filter: true,
        can_sort: true 
    },
    "degree.name": {
        can_filter: true,
        can_sort: true
    }
};

const CurriculaController = {

    index: async req => {
        const user = req.user
        const query = req.query
        const pipeline = ModelController.queryFieldsToPipeline(query, fields)

        const restrict = user.admin ? [] : [
            // remove disabled degrees
            {$match: {
                "degree.enabled": true
            }},
        ]

        const [ res ] = await Curriculum.aggregate([
            // add related degree to eventually check if it is disabled
            {$lookup: {
                from: "degrees",
                localField: "degree_id",
                foreignField: "_id",
                as: "degree"
            }},
            // flatten degree, take care of empty arrays
            {$unwind: {
                path: "$degree",
                preserveNullAndEmptyArrays: true
            }},
            ...restrict,
            ...pipeline,
        ])

        return res
    }, 

    view: async req => {
        const { id } = req.params
        return await ModelController.view(Curriculum, id)
    },

    post: async req => {
        return await ModelController.post(Curriculum, req.body)
    }
}

module.exports = CurriculaController;
