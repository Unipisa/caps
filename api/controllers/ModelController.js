/*
 * Controller for generic routes on top of the APIs, and from which 
 * other controllers inherit. 
 */

const { default: mongoose } = require("mongoose");
const { BadRequestError, ValidationError, NotImplementedError } = require("../exceptions/ApiException");

const ModelController = {

    /**
     * restrict: restricts the query to a subset of the collection
     *    used as {$match: restrict} in the pipeline
     */
    index: async (Model, query, fields, {  populate, restrict } = {}) => {
        let $match = {};
        let filter = {};
        let sort = "_id";
        let direction = 1;
        let limit = 100;

        for (key in query) {
            const value = query[key];
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
                } else if (field.match_id_object) {
                    $match[key] = mongoose.Types.ObjectId(value);
                } else {
                    $match[key] = value;
                }
            }
        }

        console.log($match);

        let total, items;
        const $sort = {};
        $sort[sort] = direction;
        const pipeline = [
            {$match: restrict || {}},
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
        ]
        console.log(`Model ${Model.url} pipeline`, JSON.stringify(pipeline))
        const res = await Model.aggregate(pipeline)
        if (res.length === 0) {
            total = 0;
            items = res;
        } else {
            [{ total, items }] = res;
        }
            
        if (populate !== undefined) {
            await Model.populate(items, { path: populate })
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

    view: async (Model, id, { populate } = {}) => {
        try {
            const obj = (id === '__new__') ? new Model() : await Model.findById(id)
            if (populate !== undefined) return await obj.populate(populate)
            else return obj
        } catch(err) {
            console.log(`not found ${id}`)
            throw new BadRequestError()
        }
    },

    patch: async (Model, id, data) => {
        try {
            console.log(`ModelController.patch ${Model} ${id} ${JSON.stringify(data)}`)
            await Model.findByIdAndUpdate(id, data, { runValidators: true })
            return {ok: true}
        } catch(err) {
            if (err instanceof mongoose.Error.ValidationError) {
                let validationErrors = {}
                for (const field in err.errors) {
                    validationErrors[field] = err.errors[field].message
                }
                throw new ValidationError(validationErrors)
            } else {
                throw new BadRequestError()
            }
        }
    },

    post: async (Model, data) => {
        try {
            const entry = new Model(data)
            await entry.save()
            return entry._id
        } catch (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                let validationErrors = {}
                for (const field in err.errors) {
                    validationErrors[field] = err.errors[field].message
                }
                throw new ValidationError(validationErrors)
            } else {
                throw new BadRequestError()
            }
        }
    },

    delete: async (Model, id) => {
        try {
            await Model.deleteOne({ _id: id})
            return {ok: true}
        } catch(err) {
            throw new BadRequestError()
        }
    }
}

module.exports = ModelController;
