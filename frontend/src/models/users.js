'use strict';

class Users {

    async get(id) {
        let response = await (
            await fetch(Caps.root + 'users/view/' + ((id === undefined) ? '' : id) + '.json')
        ).json();

        response = response['user'];

        return response;
    }

    async proposals(id) {
        const response = await (
            await fetch(Caps.root + 'users/proposals/' + id + '.json')
        ).json();

        return response['proposals'];
    }

}

export default new Users();