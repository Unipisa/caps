'use strict';

const Cache = require('../modules/cache');

class Groups {

    constructor() {
        this.cache = new Cache();
    }
    
    async all() {
        const groups = this.cache.get("groups-all", async () => {
            const response = await (
                await fetch(Caps.root + 'groups.json')
            ).json();
    
            return response["groups"];
        });

        return groups;
    }

    async get(id) {
        const group = this.cache.get("group/" + id, async () => {
            const response = await (
                await fetch(Caps.root + 'groups/view/' + id + '.json')
            ).json();
    
            return response;
        });

        return group;
    }

}

module.exports = new Groups();