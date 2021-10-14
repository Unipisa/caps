'use strict';

class Forms {

    async get(id) {
        let response = await (
            await fetch(Caps.root + 'forms/view/' + id + '.json')
        ).json();

        response = response['form'];

        response['data'] = JSON.parse(response['data']);

        return response;
    }

}

module.exports = new Forms();