import Model from './Model';

export default class Degree extends Model {
    static api_url = 'degrees/';
    static table_headers = [
        {   
            field: 'enabled',
            label: "Attivo",
        }, {   
            field: 'enable_sharing',
            label: "Richiesta parere"
        }, {   
            field: 'academic_year',
            label: "Anno accademico",
            enable_sort: true
        }, {   
            field: 'name',
            label: "nome",
            enable_sort: true,
            enable_link: true
        }, {   
            field: 'years',
            label: "Anni",
            enable_sort: true 
        }];
    static sort_default = 'name';
    static sort_default_direction = 1;

    render_table_field(field) {
        if (field == "enabled") {
            return this.enabled ? "attivo" : "non attivo";
        } else if (field == "enable_sharing") {
            return this.enable_sharing ? "abilitata" : "non abilitata";
        } else {
            return super.render_table_field(field);
        }
    }

    academic_years() {
        if (!this.academic_year) return null
        return `${this.academic_year}/${this.academic_year+1}`
    }
}
