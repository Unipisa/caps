'use strict';

const Cache = require('../modules/cache');

class Exams {

    constructor() {
        this.cache = new Cache();
    }

    async all() {
        const exams = this.cache.get("exams-all", async () => {
            const response = await (
                await fetch(Caps.root + 'exams.json')
            ).json();
            return response["exams"];
        });

        return exams;
    }

}

module.exports = new Exams();