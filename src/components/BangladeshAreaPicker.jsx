import {useEffect,useMemo,useRef,useState} from 'react';
import {FiChevronDown,FiMapPin,FiSearch} from 'react-icons/fi';
import api,{message} from '../services/api';

let cachedAreas;
let areasRequest;

export default function BangladeshAreaPicker({value,onChange,disabled=false,label='Area',required=false,compact=false}){
  const [areas,setAreas]=useState(cachedAreas||[]),[query,setQuery]=useState(value?.name||''),[open,setOpen]=useState(false),[loading,setLoading]=useState(!cachedAreas),[error,setError]=useState('');
  const root=useRef(null);
  useEffect(()=>{if(cachedAreas)return;areasRequest??=api.get('/locations/areas');areasRequest.then(r=>{cachedAreas=r.data.data||[];setAreas(cachedAreas)}).catch(e=>setError(message(e))).finally(()=>setLoading(false))},[]);
  useEffect(()=>{setQuery(value?.name?`${value.name}, ${value.district}`:'')},[value?.name,value?.district]);
  useEffect(()=>{const close=e=>{if(!root.current?.contains(e.target))setOpen(false)};document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close)},[]);
  const matches=useMemo(()=>{const q=query.toLowerCase().trim();return areas.filter(x=>!q||`${x.name} ${x.bn_name} ${x.district} ${x.division}`.toLowerCase().includes(q)).slice(0,40)},[areas,query]);
  const select=item=>{onChange(item);setQuery(`${item.name}, ${item.district}`);setOpen(false)};
  return <label className="form-control" ref={root}>{!compact&&<span className="label-text mb-2 font-medium flex items-center gap-2"><FiMapPin className="text-primary"/>{label}</span>}<div className="relative"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10"/><input className="field pl-11 pr-10" value={query} required={required} disabled={disabled||loading} placeholder={loading?'Loading all Bangladesh areas...':'Search any upazila, district or বাংলা name'} onFocus={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);onChange(null);setOpen(true)}}/><FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/>{open&&!loading&&<div className="absolute z-50 top-full mt-2 w-full max-h-72 overflow-auto bg-white border border-slate-200 rounded-xl shadow-2xl p-1">{matches.length?matches.map(x=><button type="button" key={x.id} onClick={()=>select(x)} className="w-full text-left px-4 py-3 rounded-lg hover:bg-amber-50 transition"><span className="font-semibold text-ink">{x.name}</span><span className="ml-2 text-slate-500">{x.bn_name}</span><span className="block text-xs text-slate-400 mt-1">{x.district} · {x.division} Division</span></button>):<p className="p-4 text-sm text-slate-500">No Bangladesh area found</p>}</div>}</div>{error&&<span className="text-error text-sm mt-2">Could not load areas: {error}</span>}</label>
}

export async function resolveArea(location){if(!location)return null;const r=await api.post('/areas/resolve',{name:location.name,district:location.district,division:location.division});return r.data.data}
