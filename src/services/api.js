import axios from 'axios';
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:8000/api'});
let lastActionButton=null;
if(typeof document!=='undefined'){
  document.addEventListener('click',e=>{const button=e.target.closest?.('button.btn');if(button)lastActionButton=button},true);
  document.addEventListener('submit',e=>{if(e.submitter?.matches?.('button.btn'))lastActionButton=e.submitter},true);
}
const beginButtonLoading=button=>{if(!button||button.dataset.apiPending)return;button.dataset.apiPending='true';button.dataset.originalHtml=button.innerHTML;button.disabled=true;button.innerHTML='<span class="loading loading-spinner loading-sm"></span><span>Processing...</span>'};
const endButtonLoading=button=>{if(!button?.dataset.apiPending)return;button.innerHTML=button.dataset.originalHtml||'Done';delete button.dataset.originalHtml;delete button.dataset.apiPending;button.disabled=false};
api.interceptors.request.use(c=>{const t=localStorage.getItem('access_token');if(t)c.headers.Authorization=`Bearer ${t}`;c.params=Object.fromEntries(Object.entries(c.params||{}).filter(([,value])=>value!==''&&value!==null&&value!==undefined));if(c.method?.toLowerCase()==='get'&&t)c.params._ts=Date.now();if(['post','put','patch','delete'].includes(c.method?.toLowerCase())){c._actionButton=lastActionButton;beginButtonLoading(c._actionButton)}return c});
let refreshing;
api.interceptors.response.use(r=>{endButtonLoading(r.config?._actionButton);return r},async e=>{const original=e.config;if(e.response?.status===401&&!original._retry&&localStorage.getItem('refresh_token')){original._retry=true;try{refreshing??=axios.post(`${api.defaults.baseURL}/auth/refresh`,{refresh_token:localStorage.getItem('refresh_token')});const r=await refreshing;refreshing=null;localStorage.setItem('access_token',r.data.data.access_token);original.headers.Authorization=`Bearer ${r.data.data.access_token}`;return api(original)}catch{refreshing=null;localStorage.clear();window.location.href='/login'}}endButtonLoading(original?._actionButton);return Promise.reject(e)});
export const message=e=>e.response?.data?.message||e.response?.data?.detail?.[0]?.msg||e.message||'Something went wrong';export default api;
