'use strict';

class Users {

    async get(id) {
        let response = await (
            await fetch(Caps.root + 'users/view/' + id + '.json')
        ).json();

        response = response['user'];

        return response;
    }

}

module.exports = new Users();