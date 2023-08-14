import Model from './Model'

export default class Attachment extends Model {
    static api_url = 'comments/'
    static table_headers = [
        {   
            field: 'creator_id',
            label: "creato da",
            enable_sort: true,
        } ]
    static sort_default = 'creator_id'
    static sort_default_direction = 1
}

