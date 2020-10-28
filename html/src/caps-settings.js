var jQuery = require('jquery');
var FroalaEditor = require('froala-editor');
var listPlugin = require('froala-editor/js/plugins/lists.min.js');

jQuery(document).ready(function () {
  jQuery('.caps-settings-html').each(function (idx, el) {
    new FroalaEditor('#' + jQuery(el).attr('id'));
  });
});
