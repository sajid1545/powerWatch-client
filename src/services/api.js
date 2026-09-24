import axios from 'axios';
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:8000/api'});
api.interceptors.request.use(c=>{const t=localStorage.getItem('access_token');if(t)c.headers.Authorization=`Bearer ${t}`;return c});
let refreshing;
api.interceptors.response.use(r=>r,async e=>{const original=e.config;if(e.response?.status===401&&!original._retry&&localStorage.getItem('refresh_token')){original._retry=true;try{refreshing??=axios.post(`${api.defaults.baseURL}/auth/refresh`,{refresh_token:localStorage.getItem('refresh_token')});const r=await refreshing;refreshing=null;localStorage.setItem('access_token',r.data.data.access_token);original.headers.Authorization=`Bearer ${r.data.data.access_token}`;return api(original)}catch{refreshing=null;localStorage.clear();window.location.href='/login'}}return Promise.reject(e)});
export const message=e=>e.response?.data?.message||e.response?.data?.detail?.[0]?.msg||e.message||'Something went wrong';export default api;
