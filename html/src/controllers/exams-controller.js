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
            upload_fields: ['nome','codice','settore','crediti'], 
            upload_fields_db: ['name','code','sector','credits'], 
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

}

module.exports = CapsExamsController;