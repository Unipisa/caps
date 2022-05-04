import Model from './Model';
import api from '../modules/api';

export default class Curriculum extends Model {
    static api_url = 'curricula/';
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
    static sort_default = 'name';
    static sort_default_direction = 1;

    load_related(cache, setCache) {
        const id = this.item.degree;
        this.degree = cache[0][id];
        if (this.degree === undefined) {
            // cache[0] is modified in place on purpose
            // so that the state is not changed
            // set the value to null !== undefined
            // so that we know that this value has already been requested
            cache[0][id] = null;
            api.get(`degrees/${ id }`).then(
                ( degree ) => {
                    // modify volatile cache[0]
                    cache[0][id] = degree; 
                    // finally modify the state so that
                    // react is going to redraw the component
                    setCache([cache[0]]);  
                }
            )// .catch( err => { flashCatch(err) })
        }
    }

    render_table_field(field) {
        if (field === "degree.name") {
            return this.degree ? this.degree.name : "...";
        } else if (field === "degree.academic_year") {
            return this.degree ? this.degree.academic_year : "...";
        } else {
            return super.render_table_field(field);
        }
    }
}
