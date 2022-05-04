import Model from './Model';
import api from '../modules/api';

export default class Curriculum extends Model {
    static api_url = 'curricula/';
    static table_headers = [
        {   
            field: 'academic_year',
            label: "Anno",
            enable_sort: true
        }, {   
            field: 'degree',
            label: "laurea",
            enable_sort: true,
            enable_link: true
        }, {   
            field: 'name',
            label: "nome",
            enable_sort: true,
            enable_link: true
        }];
    static sort_default = 'name';
    static sort_default_direction = 1;

    load_related(cache, setCache) {
        const id = this.item.degree;
        this.degree = cache[id];
        if (this.degree === undefined) {
            setCache({...cache, [id]: null })
            api.get(`degrees/${ id }`).then(
                ( degree ) => {
                    setCache({...cache, [id]: degree});
                }
            )// .catch( err => { flashCatch(err) })
        }
    }

    render_table_field(field) {
        if (field == "degree") {
            return this.degree;
        } else {
            return super.render_table_field(field);
        }
    }
}
