import axios from 'axios';
import { useState } from 'react';
import { useQuery } from 'react-query';

type FormData = {
    [k: string]: {name: string, id: number} | undefined
}
type Result = {
    [k: string]: number
}
const initialState: FormData = {
    state: {name: 'Delta', id: 25},
    lga: undefined
};

const Index = () => {
    const [formData, setFormData] = useState(initialState);
    const [lgaResult, setLgaResult] = useState<Result>()
    const [errorMessage, setErrorMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const {
        isLoading: loadingLga,
        data: lgaList,
    } = useQuery<{ id: number, name: string }[]>(['fetch-list', 'lga', 25], async () => {
        return (await axios.post<{ rows: any[] }>(`api/fetch-list`, {
            table: 'lga',
            data: {state_id: 25}
        })).data.rows.map((row: any) => {
            return { name: row.lga_name, id: row.lga_id }
        })
    }, {enabled: !loading})

    const handleLgaChange = (event: any) => {
        const lga = lgaList?.find(lga => lga.id === Number(event.target.value))
        setLgaResult(undefined)
        setFormData({
            ...formData,
            lga
        });
        if (lga)
        getResult(lga.id)
    };

   
    async function getResult(lgaID: number) {
        setLoading(true);
        try {
            const result = (await axios.get(`api/get-lga-result/${lgaID}`)).data;
            if (result.success) {
                setLgaResult(result.data);
            }
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const lgaID = formData.lga?.id
        if (!lgaID) return;
        await getResult(lgaID);
    };


    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: 10, alignItems: 'center', justifyContent: 'center'}}>
            
            <form style={{display: 'flex', gap: '10px', flexDirection: 'column'}} onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '10px' }}>

                    <label>
                        State:<br />
                        <select>
                            <option value="25">Delta</option>
                        </select>
                    </label>
                    {formData.state && (
                        <>
                            <label>
                                Local Government Area (LGA):<br />
                                <select disabled={loading} value={formData.lga?.id} onChange={handleLgaChange}>
                                    <option value="">Select LGA</option>
                                    {lgaList?.map(lga => <option key={lga.id} value={lga.id}>{lga.name}</option>)}
                                </select>
                            </label>
                        </>
                    )}
                </div>
                <button disabled={!formData.lga || loading} type="submit">Refresh Results</button>
            </form>
            {!!lgaResult && <div style={{display: 'flex', flexDirection: 'column', gap: 10, minWidth: '200px'}}>
                {Object.keys(lgaResult).map(party => <div style={{ fontSize: '22px', display: 'flex' }} key={party}>
                    <strong >{party}</strong> <span style={{ alignItems: 'center', justifyContent: 'center', minWidth: '70px', display: 'inline-flex', marginLeft: 'auto', backgroundColor: 'gainsboro', borderRadius: '3px', paddingLeft: '4px', paddingRight: '4px' }}>
                        {lgaResult[party].toLocaleString()}</span>
                </div>)}
            </div>}
            {!!errorMessage && <div>{errorMessage}</div>}
        </div>
    );
}

export default Index;