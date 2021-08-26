'use strict';

class Degrees {

    async all() {
        const response = await (
            await fetch(Caps.root + 'degrees.json')
        ).json();

        return response["degrees"];
    }

    async allActive() {
        const response = await (
            await fetch(Caps.root + 'degrees.json?enabled=1')
        ).json();

        return response["degrees"];
    }

    async get(id) {
        const response = await (
            await fetch(Caps.root + 'degrees/view/' + id + '.json')
        ).json();

        return response;
    }
}

module.exports = new Degrees();