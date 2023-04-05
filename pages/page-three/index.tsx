import axios from 'axios';
import { useState } from 'react';
import { useQuery } from 'react-query';

type FormData = {
    [k: string]: {name: string, id: number, uniqueid?: number} | undefined
}
type Result = {
    [k: string]: number
}
const initialState: FormData = {
    state: {name: 'Delta', id: 25},
    lga: undefined,
    ward: undefined
};

const Index = () => {
    const [formData, setFormData] = useState(initialState);
    const [pollingUnitNumber, SetPollingUnitNumber] = useState('')
    const [pollingUnitName, SetPollingUnitName] = useState('')
    const [pollingUnitDesc, SetPollingUnitDesc] = useState('')
    const [pollingUnitData, setPollingUnitData] = useState<Result>({})
    const [errorMessage, setErrorMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const {
        isLoading: loadingParties,
        data: partyList,
    } = useQuery<{ id: number, name: string }[]>(['fetch-list', 'party', 25], async () => {
        return (await axios.post<{ rows: any[] }>(`api/fetch-list`, {
            table: 'party'
        })).data.rows.map((row: any) => {
            return { name: row.partyid, id: row.id }
        })
    })
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
    const {
        isLoading: loadingWard,
        data: wardList,
    } = useQuery<{ id: number, name: string }[]>(['fetch-list', 'ward', formData.lga?.id], async () => {
        return (await axios.post<{ rows: any[] }>(`api/fetch-list`, {
            table: 'ward',
            data: { lga_id: formData.lga?.id }
        })).data.rows.map((row: any) => {
            return {name: row.ward_name, id: row.ward_id, uniqueid: row.uniqueid}
        })
    }, { enabled: !!formData.lga && !loading })

    const handleLgaChange = (event: any) => {
        const lga = lgaList?.find(lga => lga.id === Number(event.target.value))
        setPollingUnitData({})
        setFormData({
            ...formData,
            lga,
            ward: undefined,
        });
    };

    const handleWardChange = (event: any) => {
        const ward = wardList?.find(ward => ward.id === Number(event.target.value))
        setPollingUnitData({})
        setFormData({
            ...formData,
            ward,
            pollingUnit: undefined,
        });
    };

    const handlePUvalueChange = (event: any) => {
        const value = event.target.value || '0';
        const name = event.target.name;
        setPollingUnitData(old => {
            return {
                ...old,
                [name]: Math.max(0, Number(value))
            }
        })
    }

    const handleCreatePollingUint = (event: any) => {
        event.preventDefault();
        console.log('PU Data => ', pollingUnitData)
        // TODO handle polling unit result storage
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10, alignItems: 'center', justifyContent: 'center' }}>
            
            <h3>Polling Unit Result Creation</h3>
            <form style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
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
                            {formData.lga && (
                                <>
                                    <label>
                                        Ward:<br />
                                        <select disabled={loading} value={formData.ward?.id} onChange={handleWardChange}>
                                            <option value="">Select Ward</option>
                                            {wardList?.map(ward => <option key={ward.id} value={ward.id}>{ward.name}</option>)}
                                        </select>
                                    </label>
                                </>
                            )}
                        </>
                    )}
                </div>
            </form>
            {!!formData.ward && <form style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: '200px' }} onSubmit={handleCreatePollingUint}>
                <div style={{display: 'flex', gap: '10px'}}><label>
                    Polling Unit Number*:<br />
                    <input value={pollingUnitNumber} type='text' />
                </label>
                    <label>
                        Polling Unit Name*:<br />
                        <input value={pollingUnitName} type='text' />
                    </label>
                    <label>
                        Polling Unit Desc:<br />
                        <input value={pollingUnitDesc} type='text' />
                    </label>
                </div>
                {partyList?.sort((a, b) => a.name > b.name ? 1: -1).map(party => <div style={{ fontSize: '22px', display: 'flex', gap: '10px' }} key={party.id}>
                    <strong style={{display: 'block'}} >{party.name}</strong> <input name={party.name} onChange={handlePUvalueChange} value={pollingUnitData[party.name] || '0'} type='number' style={{ alignItems: 'center', justifyContent: 'center', minWidth: '70px', display: 'inline-flex', marginLeft: 'auto', backgroundColor: 'gainsboro', borderRadius: '3px', paddingLeft: '4px', paddingRight: '4px' }}/>
                </div>)}

                <button disabled={!formData.ward || loading} type="submit">Create Polling Unit</button>
            </form>}
            {!!errorMessage && <div>{errorMessage}</div>}
        </div>
    );
}

export default Index;