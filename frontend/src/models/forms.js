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

    async delete(id) {
        let response = await (
            await fetch(Caps.root + `api/v1/forms/delete/${id}.json`)
        ).json();

        return response;
    }

}

export default new Forms();