'use strict';

class Forms {

    async get(id) {
        const response = await (
            await fetch(Caps.root + 'forms/view/' + id + '.json')
        ).json();

        return response;
    }

}

module.exports = new Proposals();