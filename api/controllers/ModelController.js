/*
 * Controller for generic routes on top of the APIs, and from which 
 * other controllers inherit. 
 */

const { default: mongoose } = require("mongoose");
const { BadRequestError, ValidationError, NotImplementedError, NotFoundError } = require("../exceptions/ApiException");
const crypto = require('crypto')

const PERMISSION_SECRET = process.env.PERMISSION_SECRET || crypto.randomUUID()

function queryFieldsToPipeline(query={}, fields={}) {
    let $match = {};
    let filter = {};
    let sort = "_id";
    let direction = 1;
    let limit = Number.MAX_SAFE_INTEGER;

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
                $match[key] = field.match_regex(value)
            } else if (field.match_integer) {
                $match[key] = parseInt(value);
            } else if (field.match_ids) {
                $match['_id'] = {
                    $in: value.split(",").map(id => new mongoose.Types.ObjectId(id))
                };
            } else if (field.match_id_object) {
                $match[key] = new mongoose.Types.ObjectId(value);
            } else if (field.match_boolean) {
                const v = {
                    "true": true, 
                    "false": false,
                    "0": false,
                    "1": true,
                }[value]
                if (v === undefined) throw new BadRequestError(`invalid boolean value ${value}`)
                $match[key] = v
            } else {
                $match[key] = value;
            }
        }
    }

    const $sort = {};
    $sort[sort] = direction;
    const pipeline = [
        {$match},
        {$sort},
        {$facet:{
            "counting": [ 
                { "$group": {_id:null, count:{$sum:1}}},
            ],
            "limiting" : [ { "$skip": 0}, {"$limit": limit} ]
        }},
        // if the pipeline is empty, the facet returns an empty array
        // so we need to add a dummy entry
        {$addFields: {
            "counting": { $cond: { if: { $eq: [ "$counting", [] ] }, then: [ {_id: null, count: 0} ], else: "$counting" } }
        }},
        {$unwind: {
            "path": "$counting",
        }},
        {$project:{
            total: "$counting.count",
            items: "$limiting",
            fields: {$literal: fields},
            sort: {$literal: sort},
            direction: {$literal: direction},
            limit: {$literal: limit},
            query: {$literal: query},
            match: {$literal: $match},
        }},
    ]
    console.log(`queryFieldsToPipeline ${JSON.stringify(query)} => ${JSON.stringify(pipeline)}`)
    return pipeline
}

const ModelController = {
    queryFieldsToPipeline,

    /**
     * restrict: restricts the query to a subset of the collection
     *    used as {$match: restrict} in the pipeline
     */
    index: async (Model, query, fields, {  populate, restrict } = {}) => {
        const pipeline = queryFieldsToPipeline(query, fields)

        // attenzione all'output, nella pipeline ci sono oggetti che non 
        // vengono serializzati correttamente:
        // gli ObjectId sembrano stringhe,
        // le RegExp sembrano oggetti vuoti
        console.log(`${Model.modelName}.index PIPELINE ${JSON.stringify(pipeline)}`)

        const [ res ] = await Model.aggregate(pipeline)

        const items = res.items
        const total = res.total
            
        if (populate !== undefined) {
            await Model.populate(items, { path: populate })
        }
        console.log(`${items.length} / ${total} items collected`);

        return res
    },

    view: async (Model, id, { populate, toObject } = {}) => {
        try {
            const empty = id === '__new__'
            let obj = empty ? new Model() : await Model.findById(id)
            if (populate !== undefined) obj = await obj.populate(populate)
            if (toObject) obj = toObject(obj)
            else obj = obj.toObject()
            if (empty) obj._id = undefined
            return obj
        } catch(err) {
            console.log(`not found ${id}`)
            throw new NotFoundError()
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
            throw new NotFoundError()
        }
    },

    signedId: (id) => {
        const hash = crypto.createHash('sha256')
        hash.update(id)
        hash.update(PERMISSION_SECRET)
        return `${id}-${hash.digest('hex')}`
    },

    idFromSignedIdIfValid: (signedId) => {
        console.log(`isSignedIdValid ${signedId}`)
        const [id, signature] = signedId.split("-")
        console.log(`id ${id} signature ${signature}`)
        console.log(`signedId ${ModelController.signedId(id)}`)
        return signedId === ModelController.signedId(id) ? id : null
    },
}

module.exports = ModelController;
