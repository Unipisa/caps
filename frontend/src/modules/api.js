'use strict';

class RestClient {

    constructor() {
        this.csrf = document.getElementsByName('csrfToken')[0].content
    }

    async fetch(uri, method = 'GET', data = null) {
        const res = await fetch(Caps.root + 'api/v1/' + uri, {
            method: method, 
            headers: {
                'Content-Type': 'application/json', 
                'X-CSRF-Token': this.csrf
            }, 
            body: data ? JSON.stringify(data) : null
        });

        return await res.json();
    }

    async status() {
        return await this.fetch('status');
    }

    async delete(uri) {
        return await this.fetch(uri, 'DELETE');
    }

    async get(uri, query = {}) { 
        const params = new URLSearchParams(query);
        return await this.fetch(uri + '?' + params.toString(), 'GET');
    }

}

export default new RestClient();