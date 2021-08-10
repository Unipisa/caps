const CapsAppController = require('./app-controller');
const CsvUpload = require('../modules/upload-csv');

class CapsExamsController extends CapsAppController {

    async index(params) {
        // Asynchronous loading of the exams database, which needs to be 
        // remapped as code -> exam, for quick lookups later on. 
        const exams_json = await (await fetch('exams.json')).json();
        var db_exams = {};
        exams_json.exams.forEach((exam) => {
            db_exams[exam.code] = exam;
        })

        const csv = new CsvUpload({
            upload_fields: ['nome', 'codice', 'settore', 'crediti'],
            upload_fields_db: ['name', 'code', 'sector', 'credits'],
            validator: function (item, context) {
                if (!context.used_codes) context.used_codes = {};
                if (item.name === "") return "nome vuoto";
                if (item.code === "") return "codice vuoto";
                if (db_exams.hasOwnProperty(item.code)) return "codice già presente in database";
                if (context.used_codes.hasOwnProperty(item.code)) return "codice già utilizzato";
                context.used_codes[item.code] = true;
                return null;
            },
            csrf_token: params._csrfToken
        });
    }

    edit(params) {
        // If the user changes the value of the exam code, assuming this is not a new 
        // exam, then we show a warning that says that this is dangerous. 
        if (params.pass.length > 0 && params.pass.id != 0) {
            const el = document.getElementById('code');
            const previous_code = el.value;
            const warning_note = document.getElementById('code-warning-note');
            el.addEventListener('input', () => {
                if (el.value != previous_code) {
                    warning_note.classList.remove('d-none');
                    el.classList.add('is-invalid');
                }
                else {
                    warning_note.classList.add('d-none');
                    el.classList.remove('is-invalid');
                }
            })
        }
    }

}

module.exports = CapsExamsController;