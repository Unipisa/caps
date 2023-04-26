import Model from './Model';

export default class Exam extends Model {
    static api_url = 'exams/';
    static table_headers = [
        {   
            field: 'name',
            label: "Nome",
            enable_link: true,
            enable_sort: true
        }, {   
            field: 'tags',
            label: "Etichette"
        }, {   
            field: 'code',
            label: "Codice",
            enable_sort: true
        }, {   
            field: 'sector',
            label: "Settore",
            enable_sort: true
        }, {   
            field: 'credits',
            label: "Crediti",
            enable_sort: true 
        }, {
            field: 'notes',
            label: "Note"
        }];
    static sort_default = 'name';
    static sort_default_direction = 1;
    
    render_table_field(field) {
        if (field == "tags") {
            return this.tags.join(", ");
        } else {
            return super.render_table_field(field);
        }
    }
}
