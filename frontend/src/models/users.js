'use strict';

import RestClient from "../modules/api";

class Users {

    async get(id) {
        return await RestClient.fetch('users/' + id);
    }

    async proposals(id) {
        const response = await (
            await fetch(Caps.root + 'users/proposals/' + id + '.json')
        ).json();

        return response['proposals'];
    }

}

export default new Users();