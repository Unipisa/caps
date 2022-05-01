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
        }];
    static sort_default = 'name';
    static sort_default_direction = 1;

}
