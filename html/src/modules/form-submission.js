'use strict';

/**
 * This function creates a form in the DOM, with display: none set, and create 
 * hidden fields with name equal to the keys found in params, and value equal to
 * params[key]. Then, the form is submit to the specified action using the given 
 * method (GET or POST). 
 * 
 * params is an instance of UrlSearchParams with the fields that will be present
 *   in the form. 
 */
function submitForm(action, method, params) {
    var form = document.createElement('form');

    form.action = action;
    form.method = method;

    for (let p of params) {
        var hf = document.createElement('input');
        hf.type = "hidden";
        hf.name = p[0];
        hf.value = p[1];
        form.appendChild(hf);
    }

    form.style.display = "none";

    const body = document.getElementsByTagName("body")[0];
    body.appendChild(form);
    
    form.submit();
}

module.exports = submitForm;