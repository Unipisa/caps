import settings from './settings';

class Model {
    constructor(item) {
        this.item = item;
    }

    view_url() {
        return `${settings.root_url}${this.constructor.api_url}view/${this.item._id}`
    }
}

class Exam extends Model {
    static api_url = 'exams/';
    static table_headers = ["name", "tags", "code", "sector", "credits"];
    static verbose = {
        'name': "Nome",
        'tags': "Codice",
        'code': "Settore",
        'credits': "Crediti"
    }
}

class User {
    static api_url = 'users/';
}

export default  { Exam, User };