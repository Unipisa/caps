const Settings = require('../models/Settings')

async function settingsController(req) {
    if (req.method === 'GET') {
        const res = await Settings.find()
        return res[0]
    }
    if (req.method === 'POST') {
        const data = req.body
        await Settings.updateMany({}, data, {upsert: true})
        return {success: true}
    } 
    throw new Error("unsupported method")
}

module.exports = settingsController