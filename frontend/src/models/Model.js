import settings from '../modules/settings';

export default class Model {
    constructor(item) {
        this.item = item;
    }

    view_url() {
        return `${settings.root_url}${this.constructor.api_url}${this.item._id}`
    }

    render_table_field(field) {
        return this.item[field];
    }
}
