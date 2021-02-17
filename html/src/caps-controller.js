//
// This class implements all the handler needed by the elements in CAPS.
//
jQuery = require('jquery');

'use strict'

class CapsController {

  constructor(root = "/") {
    this.root = root;

    jQuery(document).ready(() => {
        this.updateProposalsURL();
    });
  }

  downloadCSV() {
    location.pathname += '.csv';
  }

  // This function is automatically called on proposals/view, to save the
  // current state of the filters.
  saveProposalsFilter(filter) {
      sessionStorage.setItem('proposals-filter', filter);
  }

  // Replace all href attributes of a.caps-proposal-link tags, to ensure that
  // they point to the proposals page with the filters set at the last visit.
  updateProposalsURL() {
      let url = this.getProposalsURL();
      jQuery('a.caps-proposal-link').each((idx, el) => {
          jQuery(el).attr('href', url);
      });
  }

  getProposalsURL() {
      const f = JSON.parse(sessionStorage.getItem('proposals-filter'));

      if (f == null) {
          return this.root + 'proposals';
      }
      else {
          // We selectively read some query parameters from the saved ones, as
          // these are the only "officially supported ones".
          const supported_fields = [
              'state', 'surname', 'academic_year', 'degree', 
              'curriculum', 'exam_name', 'free_exam_name', 
              'page'];
          if (!f.page) f.page = '1';
          const query_string = supported_fields.map(
              function(field) {
                  return field + '=' + encodeURI(f['field']) || ''
              }).join('&');
          return this.root + 'proposals?' + query_string;
      }
  }

  // Remove the key&value pair from the URL, mainly uesd to remove some filters
  // for the current table
  removeQueryParam(param) {
      var url = location.search;
      var rx = new RegExp(param + '=[^&]*');
      location.search = url.replace(rx, '');
  }

  // Submit a form by injecting the name and value of an element; this is used
  // in several places where we allow to operate on a set of elements selected
  // by checkboxes, even with buttons that are outside the HTML <form> tags.
  submitForm(form_id, data, action_message) {
      if (action_message == null || confirm(action_message)) {
          var form = document.getElementById(form_id);

          for (var key in data) {
              // Insert hidden input entries in the form
              var inp = document.createElement('input');
              inp.name = key;
              inp.value = data[key];
              inp.style = "display: none";
              form.appendChild(inp);
          }

          form.submit();
      }
  }

}

module.exports = CapsController;
