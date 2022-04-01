'use strict';

class RestClient {

    constructor() {
        try {
            this.csrf = document.getElementsByName('csrfToken')[0].content
        } catch {
            this.csrf = null;
        }
    }

    async fetch(uri, method = 'GET', data = null) {
        let response = {}

        try {
            const res = await fetch(Caps.root + 'api/v1/' + uri, {
                method: method, 
                headers: {
                    'Content-Type': 'application/json', 
                    'X-CSRF-Token': this.csrf
                }, 
                body: data ? JSON.stringify(data) : null
            });
            response = await res.json();
        } catch {
            response = {
                code: 500, 
                message: 'RESTClient: an error occurred while performing the request.'
            };
        }

        return response;
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

    async post(uri, data) {
        return await this.fetch(uri, 'POST', data);
    }

    async put(uri, data) {
        return await this.fetch(uri, 'PUT', data);
    }

    async patch(uri, data) {
        return await this.fetch(uri, 'PATCH', data);
    }

}

export default new RestClient();