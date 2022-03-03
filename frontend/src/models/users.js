'use strict';

class Users {

    async get(id) {
        let response = await (
            await fetch(Caps.root + 'api/v1/users/get/' + ((id === undefined) ? '' : id) + '.json')
        ).json();

        response = response['user'];

        return response;
    }

    async profile(id) {

    }

    async proposals(id) {
        const response = await (
            await fetch(Caps.root + 'users/proposals/' + id + '.json')
        ).json();

        return response['proposals'];
    }

}

export default new Users();