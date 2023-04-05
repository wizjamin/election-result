import { executeSql } from "@/utils/database";
import { NextApiResponse, NextApiRequest } from "next";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') return res.status(403).send('Not Allowed');
    const {data, table} = req.body;
    if (!table) return res.status(200).json({ rows: [] })
    try {
        const rows = await executeSql(`SELECT * from ${table}${!!data ? ` WHERE ${Object.keys(data).map(key => `${key}=${data[key]}`).join(' AND ')}` : ''}`)
        return res.status(200).json({ rows })
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).send(error.message)
    }
}

export default handler;