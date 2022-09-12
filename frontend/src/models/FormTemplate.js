import Model from './Model'

export default class FormTemplate extends Model {
    static api_url = 'form_templates/'
    static table_headers = [
        {   
            field: 'name',
            label: "nome",
            enable_sort: true,
            enable_link: true
        }, {
            field: 'enabled',
            label: "attivato",
            enable_sort: true,
        }]
    static sort_default = 'name'
    static sort_default_direction = 1
}
