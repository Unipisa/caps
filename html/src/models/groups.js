'use strict';

class Groups {

    async all() {
        const response = await (
            await fetch(Caps.root + 'groups.json')
        ).json();

        return response["groups"];
    }

    async get(id) {
        const response = await (
            await fetch(Caps.root + 'groups/view/' + id + '.json')
        ).json();

        return response;
    }

}

module.exports = new Groups();