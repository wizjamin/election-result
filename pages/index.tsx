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
    ward: undefined,
    pollingUnit: undefined,
};

const Index = () => {
    const [formData, setFormData] = useState(initialState);
    const [pollingUnitResult, setPollingUnitResult] = useState<Result>()
    const [errorMessage, setErrorMessage] = useState('')
    const [searchType, setSearchType] = useState('1');
    const [findQuery, setFindQuery] = useState('');
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
    const {
        isLoading: loadingPu,
        data: puList,
    } = useQuery<{ id: number, name: string }[]>(['fetch-list', 'polling_unit', formData.lga?.id, formData.ward?.id], async () => {
        return (await axios.post<{ rows: any[] }>(`api/fetch-list`, {
            table: 'polling_unit',
            data: { lga_id: formData.lga?.id, ward_id: formData.ward?.id}
        })).data.rows.map((row: any) => {
            return { name: row.polling_unit_name, id: row.uniqueid }
        })
    }, { enabled: !!formData.lga && !!formData.ward && !loading})

    const handleLgaChange = (event: any) => {
        const lga = lgaList?.find(lga => lga.id === Number(event.target.value))
        setPollingUnitResult(undefined)
        setFormData({
            ...formData,
            lga,
            ward: undefined,
            pollingUnit: undefined,
        });
    };

    const handleWardChange = (event: any) => {
        const ward = wardList?.find(ward => ward.id === Number(event.target.value))
        setPollingUnitResult(undefined)
        setFormData({
            ...formData,
            ward,
            pollingUnit: undefined,
        });
    };

    const handlePollingUnitChange = (event: any) => {
        const pollingUnit = puList?.find(pu => pu.id === Number(event.target.value))
        setPollingUnitResult(undefined)
        setFormData({
            ...formData,
            pollingUnit,
        });
        if (pollingUnit) void getResult(pollingUnit.id)
    };

    async function getResult(puID: number) {
        setLoading(true);
        try {
            const result = (await axios.get(`api/get-polling-unit-result/${puID}`)).data;
            if (result.success) {
                setPollingUnitResult(result.data);
            }
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const puID = formData.pollingUnit?.id
        if (!puID) return;
        await getResult(puID);
    };

    const handleSearchTypeChange = (event: any) => {
        setSearchType(event.target.value)
    }

    const handleFindPollingUnitSubmit = async (event: any) => {
        event.preventDefault();
        setLoading(true)
        try {
            const result = (await axios.post('api/find-polling-unit', {
                by: searchType,
                query: findQuery.trim()
            })).data
            if (result.success) {
                setFormData({
                    ...formData,
                    lga: result.lga,
                    ward: result.ward,
                    pollingUnit: result.pollingUnit
                })
                setPollingUnitResult(result.result)
            }
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false)
        }
        
    };
    const handleFindQueryChange = (event: any) => {
        setFindQuery(event.target.value)
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10, alignItems: 'center', justifyContent: 'center' }}>
            <h3>Get Polling Unit Result</h3>
            <form style={{ display: 'flex', gap: '10px' }} onSubmit={handleFindPollingUnitSubmit}>
                <label>Find Polling unit<br/>
                    <select value={searchType} onChange={handleSearchTypeChange}>
                        <option value="1">By UniqueID</option>
                        <option value="2">By Name/Number</option>
                    </select>
                    <input disabled={loading} value={findQuery}  onChange={handleFindQueryChange} type={searchType === '1' ? 'number' : 'text'} placeholder='Search' />
                    <button disabled={loading} type='submit'>Find</button>
                </label>
            </form>
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
                            {formData.lga && (
                                <>
                                    <label>
                                        Ward:<br />
                                        <select disabled={loading} value={formData.ward?.id} onChange={handleWardChange}>
                                            <option value="">Select Ward</option>
                                            {wardList?.map(ward => <option key={ward.id} value={ward.id}>{ward.name}</option>)}
                                        </select>
                                    </label>
                                    {formData.ward && (
                                        <>
                                            <label>
                                                Polling Unit:<br />
                                                <select disabled={loading}
                                                    value={formData.pollingUnit?.id}
                                                    onChange={handlePollingUnitChange}
                                                >
                                                    <option value="">Select Polling Unit</option>
                                                    {puList?.map(pu => <option key={pu.id} value={pu.id}>{pu.name}</option>)}
                                                </select>
                                            </label>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
                <button disabled={!formData.pollingUnit || loading} type="submit">Refresh Results</button>
            </form>
            {!!pollingUnitResult && <div style={{display: 'flex', flexDirection: 'column', gap: 10, minWidth: '200px'}}>
                {Object.keys(pollingUnitResult).map(party => <div style={{ fontSize: '22px', display: 'flex' }} key={party}>
                    <strong >{party}</strong> <span style={{ alignItems: 'center', justifyContent: 'center', minWidth: '70px', display: 'inline-flex', marginLeft: 'auto', backgroundColor: 'gainsboro', borderRadius: '3px', paddingLeft: '4px', paddingRight: '4px' }}>
                        {pollingUnitResult[party].toLocaleString()}</span>
                </div>)}
            </div>}
            {!!errorMessage && <div>{errorMessage}</div>}
        </div>
    );
}

export default Index;