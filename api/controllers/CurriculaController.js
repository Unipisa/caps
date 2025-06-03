const { ObjectId } = require('mongodb')

const ModelController = require('./ModelController')
const Curriculum = require('../models/Curriculum')
const {NotFoundError, InternalServerError} = require('../exceptions/ApiException')

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
            ...curriculaLookupPipeline,
            ...restrict,
            ...pipeline,
        ])

        return res
    }, 

    view: async req => {
        const { id } = req.params
        const $match = {_id: new ObjectId(id)}
        if (!req.user.admin) {
            $match["degree.enabled"] = true
        }

        const pipeline = [
            {$match},
            ...curriculaLookupPipeline,
        ]

        const res = await Curriculum.aggregate(pipeline)

        if (res.length === 0) throw new NotFoundError()
        if (res.length > 1) throw new InternalServerError()
        return res[0]
    },

    post: async req => {
        return await ModelController.post(Curriculum, req.body)
    },

    delete: async req => {
        const { id } = req.params;
        return await ModelController.delete(Curriculum, id);
    }
}

const curriculaLookupPipeline = [
    // add related degree
    {$lookup: {
        from: "degrees",
        localField: "degree_id",
        foreignField: "_id",
        as: "degree",
        pipeline: [
            {$project: {
                _id: 1,
                name: 1,
                academic_year: 1,
                enabled: 1,
            }}
        ]
    }},
    // flatten degree, take care of empty arrays
    {$unwind: {
        path: "$degree",
        preserveNullAndEmptyArrays: true
    }},
]

module.exports = CurriculaController;
