const CapsAppController = require("./app-controller");
const ClassicEditor = require('@ckeditor/ckeditor5-build-classic');

class CapsSettingsController extends CapsAppController {

    index() {
      for (const el of document.getElementsByClassName('caps-settings-html')) {
        ClassicEditor
          .create(el, {
            toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', 'link',
                        'bulletedList', 'numberedList',  ]
          })
          .catch(error => {
            console.log('CAPS::CKEditor Error while loading the CKEditor component:');
            console.error(error);
          });
      }
    }
}

module.exports = CapsSettingsController;