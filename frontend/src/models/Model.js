import Moment from 'moment'

import settings from '../modules/settings';

export default class Model {
    constructor(item) {
        Object.entries(item).forEach(([key, val]) => {
            this[key] = val
        })
    }

    load_related(cache, setCache) {
    }

    view_url() {
        return `${settings.root_url}${this.constructor.api_url}${this._id}`
    }

    render_table_field(field) {
        let value = this[field]
        if (value instanceof Moment) {
            value = value.format("D.M.Y")
        }
        return value
    }
}
