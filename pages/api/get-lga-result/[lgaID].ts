import { executeSql } from "@/utils/database";
import { NextApiResponse, NextApiRequest } from "next";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') return res.status(403).send('Not Allowed');
    const lgaID = req.query['lgaID'];
    if (!lgaID) return res.status(400).send('No Id')
    try {
        const rows = await executeSql(`SELECT lga.lga_id, lga_name, party_abbreviation, SUM(party_score) as total_score
FROM party
RIGHT JOIN announced_pu_results ON announced_pu_results.party_abbreviation = party.partyid
JOIN polling_unit ON announced_pu_results.polling_unit_uniqueid = polling_unit.uniqueid
JOIN ward ON polling_unit.ward_id = ward.ward_id
JOIN lga ON ward.lga_id = lga.lga_id
WHERE lga.lga_id = ${lgaID}
GROUP BY lga.lga_id, lga_name, party_abbreviation
ORDER BY party_abbreviation`)
        const data: {[k: string]: number} = {};
        for (const row of rows) {
            data[row.party_abbreviation] = row.total_score || 0
        }
        return res.status(200).json({ data, success: true })
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).send(error.message)
    }
}

export default handler;