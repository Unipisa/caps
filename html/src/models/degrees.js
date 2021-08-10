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

}

module.exports = new Degrees();