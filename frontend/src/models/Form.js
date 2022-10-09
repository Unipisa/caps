import Moment from 'moment'

import Model from './Model'
import User from './User'
import FormTemplate from './FormTemplate'

export default class Form extends Model {
    constructor(json) {
        super(json)
        this.date_submitted = Moment(this.date_submitted)
        this.date_managed = Moment(this.date_managed)
    }

    static api_url = 'forms/'
    static table_headers = [
        {
            field: 'user_last_name',
            label: 'cognome',
            enable_sort: true,
        }, {   
            field: 'user_first_name',
            label: 'nome',
            enable_sort: true,
        }, {   
            field: 'form_template_name',
            label: "modello",
            enable_sort: true,
            enable_link: true,
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
