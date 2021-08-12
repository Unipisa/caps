'use strict';

const { get } = require("jquery");

class Cache {

    _data = {};

    // We default to 60 seconds expiration. This may be adjusted with 
    // setExpire()
    expire = 60000;

    setExpire(e) {
        this.expire = e;
    }

    /**
     * Obtains the cache entry associated with the given key; if not 
     * found or expired, call fun() to get the new value. 
     * 
     * @param {string} key 
     * @param {function} fun 
     */
    async get(key, fun) {
        if (this._data[key] !== undefined) {
            const now = (new Date()).getTime();

            if (this._data[key].state == 'cached') {
                if (now <= this._data[key].expires) {
                    return this._data[key].value;
                }
                else {
                    return this.refreshEntry(key, fun);
                }
            }
            else {
                // We need to wait for the call to finish, and 
                // then grab the result
                const p = new Promise((res, rej) => {
                    this._data[key].queue.push(res);
                });

                return await p;
            }
        }
        else {
            return await this.refreshEntry(key, fun);
        }
    }

    async refreshEntry(key, fun) {
        this._data[key] = { 
            state: 'refreshing',
            value: null,
            queue: []
        };

        const value = await fun();

        this._data[key].value = value;
        this._data[key].expires = (new Date()).getTime() + this.expire;
        this._data[key].state = 'cached';

        this._data[key].queue.map((q) => {
            q(value);
        });

        this._data[key].queue = [];

        return value;
    }

}

module.exports = Cache;