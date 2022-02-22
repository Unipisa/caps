'use strict';

import Cache from '../modules/cache';

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

export default new Exams();