'use strict';

import RestClient from "../modules/api";

class Proposals {

    async get(id) {
        return await RestClient.fetch('proposals/' + id);
    }

    async delete(id) {
        return await RestClient.fetch('proposals/' + id, 'DELETE');
    }

}

export default new Proposals();