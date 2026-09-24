import {useEffect,useMemo,useState} from 'react';
import {FiMapPin} from 'react-icons/fi';
import api,{message} from '../services/api';

let cachedAreas;
let areasRequest;

const unique=(rows,key)=>[...new Map(rows.map(row=>[row[key],row])).values()];

export default function BangladeshAreaPicker({value,onChange,disabled=false,label='Bangladesh location',required=false,compact=false}){
  const [areas,setAreas]=useState(cachedAreas||[]),[division,setDivision]=useState(value?.division||''),[district,setDistrict]=useState(value?.district||''),[areaName,setAreaName]=useState(value?.name||''),[loading,setLoading]=useState(!cachedAreas),[error,setError]=useState('');
  useEffect(()=>{if(cachedAreas)return;areasRequest??=api.get('/locations/areas');areasRequest.then(r=>{cachedAreas=r.data.data||[];setAreas(cachedAreas);setError('')}).catch(e=>setError(message(e))).finally(()=>setLoading(false))},[]);
  useEffect(()=>{setDivision(value?.division||'');setDistrict(value?.district||'');setAreaName(value?.name||'')},[value?.division,value?.district,value?.name]);
  useEffect(()=>{if(value?.name&&areas.length){const match=areas.find(x=>x.name===value.name&&x.district===value.district);if(match){setDivision(match.division);setDistrict(match.district);setAreaName(match.name)}}},[areas,value?.name,value?.district]);
  const divisions=useMemo(()=>unique(areas,'division').sort((a,b)=>a.division.localeCompare(b.division)),[areas]);
  const districts=useMemo(()=>unique(areas.filter(x=>x.division===division),'district').sort((a,b)=>a.district.localeCompare(b.district)),[areas,division]);
  const upazilas=useMemo(()=>areas.filter(x=>x.division===division&&x.district===district).sort((a,b)=>a.name.localeCompare(b.name)),[areas,division,district]);
  const chooseDivision=e=>{setDivision(e.target.value);setDistrict('');setAreaName('');onChange(null)};
  const chooseDistrict=e=>{setDistrict(e.target.value);setAreaName('');onChange(null)};
  const chooseArea=e=>{const name=e.target.value;setAreaName(name);onChange(areas.find(x=>x.division===division&&x.district===district&&x.name===name)||null)};
  return <div className={compact?'md:col-span-3':''}>{!compact&&<div className="label-text mb-2 font-medium flex items-center gap-2"><FiMapPin className="text-primary"/>{label}{!required&&<span className="text-xs font-normal text-slate-400">(optional)</span>}</div>}<div className="grid sm:grid-cols-3 gap-3"><label className="form-control"><span className={compact?'sr-only':'text-xs text-slate-500 mb-1'}>Division</span><select aria-label="Division" className="select-field" value={division} disabled={disabled||loading} required={required} onChange={chooseDivision}><option value="">{loading?'Loading...':'Select division'}</option>{divisions.map(x=><option value={x.division} key={x.division}>{x.division} — {x.division_bn}</option>)}</select></label><label className="form-control"><span className={compact?'sr-only':'text-xs text-slate-500 mb-1'}>District</span><select aria-label="District" className="select-field" value={district} disabled={disabled||!division} required={required} onChange={chooseDistrict}><option value="">Select district</option>{districts.map(x=><option value={x.district} key={x.district}>{x.district} — {x.district_bn}</option>)}</select></label><label className="form-control"><span className={compact?'sr-only':'text-xs text-slate-500 mb-1'}>Area / Upazila</span><select aria-label="Area / Upazila" className="select-field" value={areaName} disabled={disabled||!district} required={required} onChange={chooseArea}><option value="">Select area</option>{upazilas.map(x=><option value={x.name} key={x.id}>{x.name} — {x.bn_name}</option>)}</select></label></div>{error&&<p className="text-error text-sm mt-2">Could not load local areas: {error}</p>}</div>
}

export async function resolveArea(location){if(!location)return null;const r=await api.post('/areas/resolve',{name:location.name,district:location.district,division:location.division});return r.data.data}
