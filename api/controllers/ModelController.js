/*
 * Controller for generic routes on top of the APIs, and from which 
 * other controllers inherit. 
 */

const { BadRequestError, NotImplementedError } = require("../exceptions/ApiException");

const ModelController = {

    index: async (req, { 
            Model, fields }
        ) => {
        const filter = {};
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
                filter[key] = value;
            }
        }

        console.log(filter);

        let total, items;
        const $sort = {};
        $sort[sort] = direction;
        const res = await Model.aggregate(
            [
                {$match: filter},
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
    }
}

module.exports = ModelController;
