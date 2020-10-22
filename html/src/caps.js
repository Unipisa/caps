global.jQuery = require('jquery');

var jQueryEasing = require('jquery.easing');

var bootstrap = require('bootstrap');
var sbadmin = require('./sb-admin-2.js');

global.Chart = require('chart.js');

/*
 * This file contains a few utility functions that are useful throughout the CAPS code base, and not linked to a
 * specific page.
 */

global.Caps = {
    /*
     * This is a bit of a hack: we change the URL in the page to make the
     * controller render the CSV version of the content. This will keep all
     * the specified filters in place.
     */
    'downloadCSV': function() {
        location.pathname += '.csv';
    },

    // Remove the key&value pair from the URL, mainly uesd to remove some filters
    // for the current table
    'removeQueryParam': function(param) {
        var url = window.location.href;
        var rx = new RegExp(param + '=[^&]*');
        location.href = url.replace(rx, '');
    },

    // Submit a form by injecting the name and value of an element; this is used
    // in several places where we allow to operate on a set of elements selected
    // by checkboxes, even with buttons that are outside the HTML <form> tags.
    'submitForm': function(form_id, data, action_message) {
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
    },
};
