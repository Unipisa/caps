import dbConnect from '../../../util/dbConnect'
import Settings from '../../../models/Settings'

export async function GET() {
    await dbConnect()
    const res = await Settings.find()
    return Response.json(res)
}

/*
async function POST(req, res) {
    if (req.method === 'POST') {
        const data = req.body
        await Settings.updateMany({}, data, {upsert: true})
        return {success: true}
    } 
    throw new Error("unsupported method")
}
*/