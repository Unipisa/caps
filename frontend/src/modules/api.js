'use strict';

import { type } from "jquery";

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

    async put(uri, data) {
        return await this.fetch(uri, 'PUT', data);
    }

    async patch(uri, data) {
        return await this.fetch(uri, 'PATCH', data);
    }

}

class ApiError extends Error {
    constructor(res, uri, method, data) {
        super(res.message);
        this.name = "ApiError";
        this.code = res.code;
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
class ExtendedRestClient extends RestClient {
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
        if (res.data instanceof Array) {
            // data is a queryset, add metadata
            res.data.total = res.pagination.total;
            res.data.limit = res.pagination.limit;
            res.data.offset = res.pagination.offset;
        } 
        return res.data;
    }
}

export let restClient = new RestClient();
export let extendedRestClient = new ExtendedRestClient();

export default restClient;
