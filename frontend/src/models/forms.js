'use strict';

import RestClient from "../modules/api";

class Forms {
    async get(id) {
        return await RestClient.fetch('forms/' + id);
    }

    async delete(id) {
        return await RestClient.fetch('forms/' + id, 'DELETE');
    }

}

export default new Forms();