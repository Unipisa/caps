'use strict';

const api_root = '/api/v0/';

class BaseRestClient {

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
            const res = await fetch(api_root + uri, {
                method: method, 
                headers: {
                    'Content-Type': 'application/json', 
                    'X-CSRF-Token': this.csrf
                }, 
                body: data ? JSON.stringify(data) : null
            });
            response = await res.json();
        } catch(err) {
            response = {
                code: 500, 
                message: `fetch error: ${err.message}`
            };
            console.log(err);
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

    async patch(uri, data) {
        return await this.fetch(uri, 'PATCH', data);
    }

    async getItem(Model, id) {
        // console.log(`getItem ${Model.api_url} ${id}`)
        const data = await this.get(`${ Model.api_url }${ id }`)
        return new Model(data)
    }

    async getItems(Model, query) {
        let data = await this.get(`${ Model.api_url }`, query)
        data.items = data.items.map(item => new Model(item))
        return data
    }
}

class ApiError extends Error {
    constructor(res, uri, method, data) {
        super(res.message);
        this.name = "ApiError";
        this.code = res.code;
        this.issues = res.issues;
        this.uri = uri;
        this.method = method;
        this.data = data;
        this.res = res;
    }
}

/**
 * wrap RestClient
 * throw exception on every code different from 200
 */
class RestClient extends BaseRestClient {
    constructor() {
        super();
    }

    async status() {
        throw new Error("non usare la funzione status(), chiama get(\"status\")");
    }

    async fetch(uri, method = 'GET', data = null) {
        // genera errori casuali per testarne la gestione
        if (false && Math.random()>0.8) throw new ApiError({code:500, message: `fake random error! [${method} ${uri}]`});

        const res = await super.fetch(uri, method, data);
        if (res.code < 200 || res.code >= 300) {
            throw new ApiError(res, uri, method, data);
        }
        return res.data;
    }
}

let restClient = new RestClient();

export default restClient;
