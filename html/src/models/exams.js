'use strict';

class Exams {

    async all() {
        const response = await (
            await fetch(Caps.root + 'exams.json')
        ).json();

        return response["exams"];
    }

}

module.exports = new Exams();