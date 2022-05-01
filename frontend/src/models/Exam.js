import Model from './Model';

export default class Exam extends Model {
    static api_url = 'exams/';
    static table_headers = [
        {   
            field: 'name',
            label: "Nome",
            enable_link: true
        }, {   
            field: 'tags',
            label: "Etichette" 
        }, {   
            field: 'code',
            label: "Codice" 
        }, {   
            field: 'sector',
            label: "Settore" 
        }, {   
            field: 'credits',
            label: "Crediti" 
        }];
    static sort_default = 'name';
    static sort_default_direction = 1;

}
