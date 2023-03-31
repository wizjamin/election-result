import { executeSql } from "@/utils/database";
import { NextApiResponse, NextApiRequest } from "next";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') return res.status(403).send('Not Allowed');
    const puID = req.query['puID'];
    if (!puID) return res.status(400).send('No Id')
    try {
        const rows = await executeSql(`SELECT
states.state_id,
states.state_name,
lga.lga_id,
lga.lga_name,
ward.ward_id,
ward.ward_name,
polling_unit.uniqueid,
polling_unit.polling_unit_name,
partyid,
announced_pu_results.party_score
FROM party
LEFT JOIN polling_unit ON polling_unit.uniqueid = ${puID}
LEFT JOIN ward ON ward.uniqueid = polling_unit.uniquewardid
LEFT JOIN lga ON lga.lga_id = polling_unit.lga_id
LEFT JOIN states ON states.state_id = lga.state_id
LEFT JOIN announced_pu_results on party.partyid = announced_pu_results.party_abbreviation AND announced_pu_results.polling_unit_uniqueid = polling_unit.uniqueid
ORDER BY partyid`)
        const data: {[k: string]: number} = {};
        for (const row of rows) {
            data[row.partyid] = row.party_score || 0
        }
        return res.status(200).json({ data, success: true })
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).send(error.message)
    }
}

export default handler;