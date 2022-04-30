'use strict';

/**
 * This function creates a form in the DOM, with display: none set, and 
 * hidden fields with name equal to the parameters specified in params. 
 * 
 * Then, the form is submit to the specified action using the given method
 * (either GET or POST). 
 * 
 * @param {*} action The Url where the form is submit
 * @param {*} method A string, either 'GET' or 'POST'
 * @param {*} params An instance of URLSearchParams with the required fields. 
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

async function postLink(endpoint, csrfToken) {
    const data = new URLSearchParams();
    data.append('_csrfToken', csrfToken);

    const res = await fetch(endpoint, { 
        method: 'POST',
        body: data
    });

    return res;
}

export { submitForm as default, postLink };