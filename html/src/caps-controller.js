//
// This class implements all the handler needed by the elements in CAPS.
//
'use strict'

class CapsController {

  downloadCSV() {
    location.pathname += '.csv';
  }

  saveProposalsFilter(filter) {
      sessionStorage.setItem('proposals-filter', filter);
  }

  loadProposals() {
      const f = JSON.parse(sessionStorage.getItem('proposals-filter'));
      console.log(f);

      if (f == null) {
          location.pathname = '/proposals';
      }
      else {
          // We selectively read some query parameters from the saved ones, as
          // these are the only "officially supported ones".
          const query_string =
              `?state=${f.state ? f.state : ''}` +
              `&surname=${f.surname ? f.surname : ''}` +
              `&academic_year=${f.academic_year ? f.academic_year : ''}` +
              `&degree=${f.degree ? f.degree : ''}` +
              `&curriculum=${f.curriculum ? f.curriculum : ''}` +
              `&page=${f.page ? f.page : '1' }`;
          location.href = '/proposals' + query_string;
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

const Caps = new CapsController();

module.exports = Caps;
