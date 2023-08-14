import Model from './Model'

export default class Attachment extends Model {
    static api_url = 'attachments/'
    static table_headers = [
        {   
            field: 'filename',
            label: "nome file",
            enable_sort: true,
            enable_link: true
        }, {
            field: 'size',
            label: "dimensione",
            enable_sort: true,
        }, {
            field: 'mimetype',
            label: "tipo file",
            enable_sort: true,
        }]
    static sort_default = 'filename'
    static sort_default_direction = 1
}

