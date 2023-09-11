'use strict';

export const api_root = '/api/v0/';

class BaseRestClient {
    constructor() {
        try {
            this.csrf = document.getElementsByName('csrfToken')[0].content
        } catch {
            this.csrf = null;
        }
    }

    async fetch(uri, method = 'GET', data = null, multipart = false) {
        let response = {}
        let headers = {'X-CSRF-Token': this.csrf}
        let body = null
        if (!multipart) {
            headers['Content-Type'] = 'application/json'
            body = data ? JSON.stringify(data) : null
        } else {
            body = data
        }

        try {
            response = await fetch(api_root + uri, {
                method: method, 
                headers: headers, 
                body: body
            });
            const contentType = response.headers.get('Content-Type')
            if (contentType && contentType.split(';')[0] === 'application/json') {
                response = await response.json()
            } else {
                response = {
                    code: response.status,
                    message: response.statusText,
                }
            }
        } catch(err) {
            response = {
                code: 500, 
                message: `fetch error: ${err.message}`
            };
            console.log(`catched error: ${err}`);
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

    async post(uri, data = null, multipart = false) {
        const res = await this.fetch(uri, 'POST', data, multipart);
        return res
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
        super(`${res.statusText} [${res.status}]`);
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

    async fetch(uri, method = 'GET', data = null, multipart) {
        // genera errori casuali per testarne la gestione
        if (false && Math.random()>0.8) throw new ApiError({code:500, message: `fake random error! [${method} ${uri}]`});
        const res = await super.fetch(uri, method, data, multipart);
        // console.log(`fetch ${method} ${uri} ${JSON.stringify(data)} => ${JSON.stringify(res)}`)
        if (res.code < 200 || res.code >= 300) {
            throw new ApiError(res, uri, method, data);
        }
        return res;
    }
}

let restClient = new RestClient();

export default restClient;
