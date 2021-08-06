'use strict';

class Curricula {

    async all() {
        const response = await (
            await fetch(Caps.root + 'curricula.json')
        ).json();

        return response["curricula"];
    }

    async forDegree(degree_id) {
        const response = await (
            await fetch(Caps.root + 'degrees/curricula/' + degree_id + '.json')
        ).json();

        return response["curricula"];
    }

    async get(id) {
        const response = await (
            await fetch(Caps.root + 'curricula/view/' + id + '.json')
        ).json();

        return response;
    }

}

module.exports = new Curricula();