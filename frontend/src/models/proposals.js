'use strict';

class Proposals {

    async get(id) {
        const response = await (
            await fetch(Caps.root + 'proposals/view/' + id + '.json')
        ).json();

        return response;
    }

}

export default new Proposals();