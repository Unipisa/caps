/*
 * Controller for generic routes on top of the APIs, and from which 
 * other controllers inherit. 
 */

const { default: mongoose } = require("mongoose");
const { BadRequestError, ValidationError, NotImplementedError } = require("../exceptions/ApiException");

const validateModel = (Model, data) => {
    const validationTest = (new Model(data)).validateSync()
    if (validationTest) {
        let errors = {}
        for (const err in validationTest.errors) {
            errors[err] = validationTest.errors[err].message
        }
        throw new ValidationError(errors)
    }
}

const ModelController = {

    index: async (req, { 
            Model, fields }
        ) => {
        let $match = {};
        let filter = {};
        let sort = "_id";
        let direction = 1;
        let limit = 100;

        for (key in req.query) {
            const value = req.query[key];
            if (key == '_direction') {
                if (value=="1") direction = 1;
                else if (value=="-1") direction = -1;
                else throw new BadRequestError(`invalid _direction ${value}: 1 or -1 expected`);
            } else if (key == '_limit') {
                limit = parseInt(value);
                if (isNaN(limit) || limit < 0) throw BadRequestError(`invalid _limit ${value}: positive integer expected`);
            } else if (key == '_sort') {
                if (!(fields[value] && fields[value].can_sort)) {
                    throw new BadRequestError(`invalid _sort key ${value}. Fields: ${ JSON.stringify(fields) }`);
                }
                sort = value;
            } else if (fields[key] && fields[key].can_filter) {
                const field = fields[key];
                filter[key] = value;
                if (field.match_regex) {
                    $match[key] = { $regex: field.match_regex(value) }
                } else if (field.match_integer) {
                    $match[key] = parseInt(value);
                } else if (field.match_ids) {
                    $match['_id'] = {
                        $in: value.split(",").map(id => new mongoose.Types.ObjectId(id))
                    };
                } else {
                    $match[key] = value;
                }
            }
        }

        console.log($match);

        let total, items;
        const $sort = {};
        $sort[sort] = direction;
        const res = await Model.aggregate(
            [
                {$match},
                {$sort},
                {$facet:{
                    "counting" : [ { "$group": {_id:null, count:{$sum:1}}} ],
                    "limiting" : [ { "$skip": 0}, {"$limit": limit} ]
                }},
                {$unwind: "$counting"},
                {$project:{
                    total: "$counting.count",
                    items: "$limiting"
                }}
            ]);

        if (res.length === 0) {
            total = 0;
            items = res;
        } else {
            [{ total, items }] = res;
        }
            
        console.log(`${items.length} / ${total} items collected`);

        return {
            items,
            limit,
            sort,
            direction,
            filter,
            total
        };
    },

    view: async (req, { Model, populate }) => {
        const { id } = req.params
        try {
            const obj = await Model.findById(id)
            if (populate) return await obj.populate(populate)
            else return obj
        } catch(err) {
            console.log(`not found ${id}`)
            throw new BadRequestError()
        }
    },

    update: async (id, Model, data) => {
        validateModel(Model, data)
        try {
            await Model.findByIdAndUpdate(id, { $set: data})
        } catch(err) {
            throw new BadRequestError()
        }
    },

    insert: async (Model, data) => {
        validateModel(Model, data)
        try {
            const entry = new Model(data)
            await entry.save()
            return entry._id
        } catch (err) {
            throw new BadRequestError()
        }
    }
}

module.exports = ModelController;
