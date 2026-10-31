/* Panggilan API ke Web App Apps Script, IndexedDB (antrean offline + cache produk) */
async function call(a,p){let r;
 try{r=await(await fetch(S.api,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({token:S.tok,action:a,params:Object.assign({device_id:S.dev},p||{})})})).json()}
 catch(e){throw Object.assign(new Error('Tidak ada koneksi ke server'),{net:1})}
 if(!r.ok){if(r.error==='SESI_HABIS'){sessionStorage.t='';S.tok=''}throw new Error(r.error)}
 return r.data}
const idb=new Promise(r=>{const q=indexedDB.open('kasirpro',1);q.onupgradeneeded=()=>{q.result.createObjectStore('q',{keyPath:'event_id'});q.result.createObjectStore('kv')};q.onsuccess=()=>r(q.result)});
async function st(s,m,f){const d=await idb;return new Promise((ok,no)=>{const t=d.transaction(s,m),o=f(t.objectStore(s));t.oncomplete=()=>ok(o.result);t.onerror=()=>no(t.error)})}
async function loadP(){try{S.P=await call('getProducts',{branch_id:S.br});await st('kv','readwrite',s=>s.put(S.P,'P'))}catch(e){S.P=(await st('kv','readonly',s=>s.get('P')))||[]}}
async function pend(){return st('q','readonly',s=>s.getAll())}
