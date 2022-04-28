/*
 * Controller for generic routes on top of the APIs, and from which 
 * other controllers inherit. 
 */

const { BadRequestError, NotImplementedError } = require("../exceptions/ApiException");

exports.model_index_data = async (req, { 
        Model, 
        permitted_filter_keys, 
        permitted_sort_keys }
    ) => {
    const filter = {};
    const sort = "_id";
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
            if (!permitted_sort_keys.includes(value)) {
                throw new BadRequestError(`invalid _sort key ${value}: allowed keys: ${permitted_sort_keys}`);
            }
            sort = value;
        } else if (permitted_filter_keys.includes(key)) {
            filter[key] = value;
        }
    }

    const [{ total, items }] = await Model.aggregate(
        [
            {$sort: { sort: direction}},
            {$match: filter},
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

    console.log(`${items.length} / ${total} items collected`);

    return {
        items,
        limit,
        sort,
        total
    };
}
