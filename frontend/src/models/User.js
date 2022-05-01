import Model from './Model';

export default class User extends Model {
    static api_url = 'users/';
    static table_headers = [
        {   
            field: 'number',
            label: "Matricola",
            enable_link: true,
            enable_sort: true
        }, {   
            field: 'username',
            label: "Username",
            enable_link: true,
            enable_sort: true 
        }, {   
            field: 'email',
            label: "Email",
            enable_sort: true
        }, {   
            field: 'surname',
            label: "Cognome",
            enable_link: true,
            enable_sort: true
        }, {   
            field: 'firstname',
            label: "Nome",
            enable_link: true,
            enable_sort: true
        }];
    static sort_default = 'surname';
    static sort_default_direction = 1;
}

