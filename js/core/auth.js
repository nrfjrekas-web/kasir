/* Izin, jenis akun (kasir cabang / kasir pusat), masuk, keluar, mulai aplikasi */
const can=p=>!p||S.u.perms.includes('*')||S.u.perms.includes(p);
/* Akses semua cabang = tingkat pusat; selain itu terkunci pada cabang tertentu */
const pusat=u=>u.perms.includes('*')||u.allowed==='*';
const tipe=u=>u.role==='Kasir'?'Kasir '+(pusat(u)?'Pusat':'Cabang'):u.role;
const brName=id=>((S.B||[]).find(b=>b.branch_id===(id||S.br))||{}).branch_name||id||'';
async function boot(){
 if(S.tok){try{const d=await call('me');S.u=d.user;S.B=d.branches;
   S.br=(S.B.find(b=>b.branch_id===S.u.branch_id)||S.B[0]||{}).branch_id;await loadP();return main()}catch(e){if(e.net&&S.u)return main()}}
 if(!S.api)return noApi();login()}
const authShell=h=>`<div class="auth"><section class="auth-hero"><div class="orb o1"></div><div class="orb o2"></div><div class="hero-in"><div class="logo">${ic('store',26)}</div><h1>KASIR PRO</h1><p>Kasir multi-cabang yang tetap bisa jualan saat internet putus.</p><ul class="feat"><li>${ic('store',16)}Multi-cabang</li><li>${ic('sync',16)}Mode offline</li><li>${ic('printer',16)}Struk thermal</li></ul></div></section><section class="auth-card"><div class="auth-box">${h}</div></section></div>`;
function login(){$('#app').innerHTML=authShell(`<div><h2>Masuk</h2><p class="m">Gunakan akun kasir dari pemilik atau admin.</p></div>
 <form id="lf" class="form" style="margin:0"><label class="fl"><span>Username</span><input id="u" autocapitalize="off" autocomplete="username" required></label>
 <label class="fl"><span>Password</span><div class="pw"><input id="w" type="password" autocomplete="current-password" required><button type="button" class="ib" id="ey" aria-label="Tampilkan password">${ic('eye')}</button></div></label>
 <p class="er" id="er" role="alert"></p><button class="p lg" id="go" type="submit">Masuk</button></form>`);
 $('#ey').onclick=()=>{const w=$('#w');w.type=w.type==='password'?'text':'password'};
 $('#lf').onsubmit=async e=>{e.preventDefault();$('#go').disabled=true;$('#go').textContent='Memeriksa…';$('#er').textContent='';
  try{const d=await call('login',{username:$('#u').value.trim(),password:$('#w').value});S.tok=sessionStorage.t=d.token;boot()}
  catch(x){$('#er').textContent=x.message;$('#go').disabled=false;$('#go').textContent='Masuk'}}}
/* API_URL belum diisi pemilik: tampilkan pesan, bukan formulir */
function noApi(){$('#app').innerHTML=authShell(`<div><h2>Server belum diatur</h2><p class="m">Hubungi pemilik: URL server belum dipasang di aplikasi ini.</p></div>`)}
