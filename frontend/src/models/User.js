import Model from './Model';

export default class User extends Model {
    static api_url = 'users/';
    static table_headers = [
        {   
            field: 'id_number',
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
            field: 'last_name',
            label: "Cognome",
            enable_link: true,
            enable_sort: true
        }, {   
            field: 'first_name',
            label: "Nome",
            enable_link: true,
            enable_sort: true
        }, {
            field: 'admin',
            label: "Ruolo"
        }];
    static sort_default = 'last_name';
    static sort_default_direction = 1;

    render_table_field(field) {
        if (field == "admin") {
            return this.admin ? "admin" : "";
        }
        return super.render_table_field(field);
    }
}

