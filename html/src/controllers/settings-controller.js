const CapsAppController = require("./app-controller");
//const jQuery = require('jquery');
const ClassicEditor = require('@ckeditor/ckeditor5-build-classic');

class CapsSettingsController extends CapsAppController {

    index() {
        jQuery('.caps-settings-html').each(function (idx, el) {
            ClassicEditor
                .create(el, {
                  toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', 'link',
                             'bulletedList', 'numberedList',  ]
                })
                .catch(error => {
                  console.log('CAPS::CKEditor Error while loading the CKEditor component:');
                  console.error(error);
                });
            });
    }

}

module.exports = CapsSettingsController;