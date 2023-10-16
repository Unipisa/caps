import Model from './Model';

export default class Degree extends Model {


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
