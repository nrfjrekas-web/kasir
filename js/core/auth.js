/* Izin, masuk, keluar, mulai aplikasi */
const can=p=>!p||S.u.perms.includes('*')||S.u.perms.includes(p);
async function boot(){
 if(S.tok){try{const d=await call('me');S.u=d.user;S.B=d.branches;S.br=S.B[0]&&S.B[0].branch_id;await loadP();return main()}catch(e){if(e.net&&S.u)return main()}}
 if(!S.api)return setupApi();login()}
function login(){$('#app').innerHTML=`<main style="max-width:360px"><div class="c"><h2>KASIR PRO</h2><div class="f" style="grid-template-columns:1fr">
 <input id="u" placeholder="Username" autocapitalize="off"><input id="w" type="password" placeholder="Password"><button class="p" id="go">Masuk</button></div><p class="m" id="er"></p></div></main>`;
 $('#go').onclick=async()=>{try{const d=await call('login',{username:$('#u').value.trim(),password:$('#w').value});S.tok=sessionStorage.t=d.token;boot()}catch(e){$('#er').textContent=e.message}}}
/* Layar sambungan server: tampil sekali bila API_URL kosong dan perangkat belum tersambung (diisi pemilik) */
function setupApi(){$('#app').innerHTML=`<main style="max-width:420px"><div class="c"><h2>Sambungkan ke server</h2><p class="m">Diisi satu kali oleh pemilik. Kasir tidak perlu mengisi ini.</p><div class="f" style="grid-template-columns:1fr">
 <input id="api" placeholder="URL Web App Apps Script (…/exec)" autocapitalize="off"><button class="p" id="sv">Simpan</button><button id="cp">Salin kode Apps Script</button></div></div></main>`;
 $('#cp').onclick=copyGas;$('#sv').onclick=()=>{const u=$('#api').value.trim();if(!/^https:\/\/script\.google\.com\/.+\/exec$/.test(u))return toast('URL Web App tidak valid');S.api=localStorage.api=u;boot()}}
