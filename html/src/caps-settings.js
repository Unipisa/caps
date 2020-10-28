var jQuery = require('jquery');
var ClassicEditor = require('@ckeditor/ckeditor5-build-classic');

jQuery(document).ready(function () {
  jQuery('.caps-settings-html').each(function (idx, el) {
    ClassicEditor
        .create(el)
        .catch( error => {
            console.error( error );
        } );
  });
});
