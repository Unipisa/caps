import Moment from 'moment'

import settings from '../modules/settings'

export default class Model {
    constructor(item) {
        Object.entries(item).forEach(([key, val]) => {
            this[key] = val
        })
    }

    static related_fields = {} // field_name -> Model

    async load_related(cache, setCache) {
        Object.entries(this.constructor.related_fields).forEach(([field,Model]) => {
            const id = this[`${field}_id`]
            const cache_id = `${Model.api_url}[${id}]`
            this[field] = cache[0][cache_id]
            if (this[field] === undefined) {
                // cache[0] is modified in place on purpose
                // so that the state is not changed
                // set the value to null !== undefined
                // so that we know that this value has already been requested
                cache[0][cache_id] = null
                api.getItem(Model, id).then(
                    obj => {
                        // modify volatile cache[0]
                        cache[0][cache_id] = obj
                        // finally modify the state so that
                        // react is going to redraw the component
                        setCache([cache[0]])
                    }
                )
            }
        })
    }

    view_url() {
        return `${settings.root_url}${this.constructor.api_url}${this._id}`
    }

    render_table_field(field) {
        let value = this[field]
        if (value instanceof Model) {
            const dot = field.indexOf('.')
            if (dot>=0) return value.render_table_field(field.slice(dot+1))
            else return `${value}`
        }
        if (value instanceof Moment) {
            value = value.format("D.M.Y")
        }
        return value
    }
}
