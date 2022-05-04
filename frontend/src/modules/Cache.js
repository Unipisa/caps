class Cache {
    constructor() {
        this.storage = {}
    }

    async get(key, callback) {
        let r = this.storage[key]
        if (r !== undefined) return r
        r = await callback()
        this.storage[key] = r
        return r
    }
}

export default Cache;