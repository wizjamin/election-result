import { executeSql } from "@/utils/database";
import { NextApiResponse, NextApiRequest } from "next";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') return res.status(403).send('Not Allowed');
    const {by, query} = req.body;
    if (!query) return res.status(400).send('No Id')
    let puID = query;
    try {
        if (by !== '1') {
            const pus = await executeSql(`SELECT uniqueid FROM polling_unit WHERE polling_unit_name LIKE '%${query}%' OR polling_unit_number LIKE '%${query}%'`);
            if (!pus.length) return res.status(400).send('Not Found');
            puID = pus[0].uniqueid;
        }
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
        if (!rows.length) return res.status(400).send('NOT FOUND')
        const data: { [k: string]: number } = {};
        for (const row of rows) {
            data[row.partyid] = row.party_score || 0
        }
        const lga = {
            id: rows[0].lga_id,
            name: rows[0].lga_name
        }
        const ward = {
            id: rows[0].ward_id,
            name: rows[0].ward_name
        }
        const pollingUnit = {
            id: rows[0].uniqueid,
            name: rows[0].polling_unit_name
        }

        return res.status(200).json({ lga,ward,pollingUnit,result: data, success: true })
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).send(error.message)
    }
}

export default handler;