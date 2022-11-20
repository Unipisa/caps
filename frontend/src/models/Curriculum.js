import Model from './Model'
import Degree from './Degree'

export default class Curriculum extends Model {
    constructor(json) {
        super(json)
    }
    static related_fields = { degree: Degree }
    static api_url = 'curricula/'
    static table_headers = [
        {   
            field: 'degree.academic_year',
            label: "Anno",
            enable_sort: true
        }, {   
            field: 'degree.name',
            label: "laurea",
            enable_sort: true,
            enable_link: true
        }, {   
            field: 'name',
            label: "nome",
            enable_sort: true,
            enable_link: true
        }];
    static sort_default = 'name'
    static sort_default_direction = 1;

    render_table_field(field) {
        if (field === "degree.name") {
            return this.degree ? this.degree.name : "...";
        } else if (field === "degree.academic_year") {
            return this.degree ? this.degree.academic_year : "...";
        } else {
            return super.render_table_field(field);
        }
    }

    static ordinal(n) {
        const ordinals = [ "zero",
            "primo", "secondo", "terzo", "quarto", "quinto",
            "sesto", "settimo", "ottavo", "nono"]
        if (n < ordinals.length) return ordinals[n]
        else return `${ n+1 }-mo`
    }
}
