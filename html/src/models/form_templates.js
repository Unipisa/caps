'use strict';

class FormTemplates {

    async all() {
        const response = await (
            await fetch(Caps.root + 'form_templates.json')
        ).json();

        return response["form_templates"];
    }

    async get(id) {
        const response = await (
            await fetch(Caps.root + 'form_templates/view/' + id + '.json')
        ).json();

        return response;
    }
}

module.exports = new FormTemplates();