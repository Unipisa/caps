import Moment from 'moment'

import Model from './Model'

export default class Form extends Model {
    constructor(json) {
        super(json)
        this.date_submitted = Moment(this.date_submitted)
        this.date_managed = Moment(this.date_managed)
    }

    static api_url = 'forms/'
    static table_headers = [
        {
            field: 'user.name',
            label: 'studente',
            enable_link: true,
        }, {   
            field: 'form_template.name',
            label: "modello",
            enable_sort: true,
        }, {
            field: 'date_submitted',
            label: 'data invio',
            enable_sort: true,
        }, {
            field: 'date_managed',
            label: 'data gestione',
            enable_sort: true,
        }]
    static sort_default = 'date_managed'
    static sort_default_direction = -1
}
