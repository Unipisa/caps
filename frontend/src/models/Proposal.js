import Moment from 'moment'

import Model from './Model'

export default class Proposal extends Model {
    constructor(json) {
        super(json)
        this.date_submitted = Moment(this.date_submitted)
        this.date_managed = Moment(this.date_managed)
    }

    static api_url = 'proposals/'
    static table_headers = [
        {
            field: 'state',
            label: 'stato',
        },
        {
            field: 'user_last_name',
            label: 'cognome',
            enable_sort: true,
        }, {   
            field: 'user_first_name',
            label: 'nome',
            enable_sort: true,
        }, 
        {
            field: 'curriculum_year',
            label: 'anno',
            enable_sort: true,
        }, {
            field: 'degree_name',
            label: 'laurea',
            enable_sort: true,
        }, {   
            field: 'curriculum_name',
            label: "piano di studio",
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
