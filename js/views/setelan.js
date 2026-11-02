// ---- Pengaturan: Akun, Tampilan, Struk, Perangkat, Pengguna (user.manage) ----
const SECS=[['akun','Akun','user'],['tampil','Tampilan','sun'],['struk','Struk','printer'],['dev','Perangkat','sync'],['user','Pengguna','users','user.manage']];
const SEC={akun:sAkun,tampil:sTampil,struk:sStruk,dev:sDev,user:sUser};
async function set(){const secs=SECS.filter(s=>can(s[3]));if(!secs.some(s=>s[0]===S.st))S.st='akun';
 $('#v').innerHTML=`<div class="set"><nav class="snav" aria-label="Bagian pengaturan">${secs.map(s=>`<button data-s="${s[0]}" class="${S.st===s[0]?'on':''}">${ic(s[2],16)}${s[1]}</button>`).join('')}</nav><div id="sb"></div></div>`;
 $$('[data-s]').forEach(b=>b.onclick=()=>{S.st=b.dataset.s;set()});
 try{await SEC[S.st]()}catch(e){$('#sb').innerHTML=`<div class="empty err">${ic('alert',34)}<b>Gagal memuat</b><span>${E(e.message)}</span></div>`}}
const seg=(id,opts,val)=>`<div class="seg" id="${id}" role="radiogroup">${opts.map(o=>`<button role="radio" aria-checked="${o[0]===val}" data-v="${o[0]}" class="${o[0]===val?'on':''}">${o[1]}</button>`).join('')}</div>`;
const segOn=(id,fn)=>$$('#'+id+' button').forEach(b=>b.onclick=()=>fn(b.dataset.v));
const scopeTxt=u=>pusat(u)?'Semua cabang':'Hanya '+brName(u.branch_id);

function sAkun(){const u=S.u;
 $('#sb').innerHTML=`<div class="c prof"><span class="av lg">${E(ini(u.full_name))}</span><div><h2>${E(u.full_name)}</h2><p class="m">@${E(u.username)}</p><div class="row" style="margin-top:8px"><span class="chip pri">${E(tipe(u))}</span><span class="chip">${E(scopeTxt(u))}</span></div></div></div>
 <div class="c"><h3>Akses</h3><dl class="kv"><dt>Peran</dt><dd>${E(u.role)}</dd><dt>Cabang utama</dt><dd>${E(brName(u.branch_id))}</dd><dt>Bisa membuka</dt><dd>${pusat(u)?'Semua cabang':E(S.B.map(b=>b.branch_name).join(', '))}</dd></dl>
 <p class="m" style="margin-top:12px">${pusat(u)?'Akun tingkat pusat dapat berpindah cabang lewat pemilih cabang di bagian atas.':'Akun cabang terkunci pada cabangnya dan tidak dapat membuka cabang lain.'}</p></div>
 <div class="c"><h3>Keamanan</h3><div class="srow"><div><b>Password</b><span class="m">Minimal 8 karakter</span></div><button id="pw">Ganti password</button></div></div>
 <div class="c"><button class="d" id="lo2" style="width:100%">${ic('logout',18)}Keluar dari akun</button></div>`;
 $('#lo2').onclick=logout;
 $('#pw').onclick=async()=>{const v=await ask('Ganti password',[{name:'o',label:'Password lama',type:'password',req:1,full:1},{name:'n',label:'Password baru',type:'password',req:1,full:1,hint:'Minimal 8 karakter'},{name:'k',label:'Ulangi password baru',type:'password',req:1,full:1}],'Ganti');if(!v)return;
  if(v.n!==v.k)return toast('Konfirmasi password tidak sama','err');
  try{await call('changePassword',{old_password:v.o,new_password:v.n});toast('Password diganti','ok')}catch(e){toast(e.message,'err')}}}

function sTampil(){const t=CFG.get().theme;
 $('#sb').innerHTML=`<div class="c"><h3>Tema</h3><p class="m" style="margin-bottom:12px">Berlaku di perangkat ini saja.</p>${seg('th',[['auto','Otomatis'],['light','Terang'],['dark','Gelap']],t)}</div>`;
 segOn('th',v=>{CFG.set({theme:v});sTampil()})}

function sStruk(){const c=CFG.get();
 $('#sb').innerHTML=`<div class="c"><h3>Struk</h3><div class="form cols" style="margin-top:12px"><label class="fl"><span>Nama usaha di struk</span><input id="nm" value="${E(c.name)}" placeholder="${E(brName())}"></label>
 <label class="fl"><span>Teks penutup</span><input id="ft" value="${E(c.foot)}"></label></div>
 <div class="srow" style="margin-top:8px"><div><b>Lebar kertas</b><span class="m">Sesuaikan dengan printer thermal</span></div>${seg('pp',[['58','58 mm'],['72','80 mm']],c.paper)}</div>
 <div class="srow"><div><b>Cetak otomatis</b><span class="m">Langsung cetak setelah pembayaran berhasil</span></div><label class="sw"><input type="checkbox" id="au" ${c.auto?'checked':''} aria-label="Cetak otomatis"><span></span></label></div>
 <div class="acts" style="justify-content:flex-start"><button id="tp">${ic('printer',18)}Cetak contoh struk</button></div></div>`;
 $('#nm').onchange=e=>{CFG.set({name:e.target.value.trim()});toast('Tersimpan','ok')};$('#ft').onchange=e=>{CFG.set({foot:e.target.value.trim()});toast('Tersimpan','ok')};
 $('#au').onchange=e=>{CFG.set({auto:e.target.checked});toast('Tersimpan','ok')};segOn('pp',v=>{CFG.set({paper:v});sStruk()});
 $('#tp').onclick=()=>{fillReceipt({branch:brName(),invoice_number:'CONTOH-0001',date:new Date().toISOString(),cashier:S.u.full_name,lines:[{product_name:'Contoh produk',qty:2,unit_price:5000,total:10000}],discount:0,tax:0,grand_total:10000,paid:10000,change:0});print()}}

async function sDev(){const q=(await pend()).length,on=navigator.onLine;
 $('#sb').innerHTML=`<div class="c"><h3>Perangkat</h3><div class="srow"><div><b>Koneksi</b><span class="m">${on?'Terhubung ke internet':'Tanpa internet'}</span></div><span class="chip ${on?'pri':'bad'}">${on?'Online':'Offline'}</span></div>
 <div class="srow"><div><b>Antrean offline</b><span class="m">Transaksi tunai yang belum terkirim</span></div><span class="chip ${q?'warn':''}">${q}</span></div>
 <div class="srow"><div><b>ID perangkat</b></div><code class="dv">${E(S.dev.slice(0,8))}</code></div>
 <div class="acts" style="justify-content:flex-start"><button class="p" id="sn">${ic('sync',18)}Sinkron sekarang</button><button id="rp">Muat ulang produk</button></div></div>`;
 $('#sn').onclick=()=>sync();$('#rp').onclick=async()=>{try{await loadP();toast('Produk dimuat ulang','ok')}catch(e){toast(e.message,'err')}}}

/* Kelola akun kasir. Cabang = terkunci di satu cabang. Pusat = bertugas di cabang utama dan boleh membuka semua cabang */
async function sUser(){$('#sb').innerHTML=skel();const [L,BR]=await Promise.all([call('getUsers'),call('getBranches')]);
 const main=(BR.find(b=>b.is_main)||BR[0]||{}).branch_id,nm=id=>(BR.find(b=>b.branch_id===id)||{}).branch_name||id;
 $('#sb').innerHTML=`<div class="row" style="justify-content:space-between;margin-bottom:12px"><div><h3>Pengguna</h3><span class="m">${L.length} akun</span></div><button class="p" id="nu">${ic('plus',18)}Akun kasir</button></div>
 <div class="c">${L.map(x=>{const k=x.role_id==='R-KASIR',p=x.allowed==='*';return `<div class="item"><span class="av">${E(ini(x.full_name))}</span><div class="gr"><b>${E(x.full_name)}</b><span class="m">@${E(x.username)} · ${k?(p?'Kasir Pusat':'Kasir Cabang'):E(x.role)} · ${p?'Semua cabang':E(nm(x.branch_id))}</span></div>
  ${x.status==='active'?'':'<span class="chip bad">Nonaktif</span>'}${k?`<button class="ib" data-u="${E(x.user_id)}" aria-label="Ubah ${E(x.full_name)}">${ic('edit',18)}</button>`:''}</div>`}).join('')||empty('users','Belum ada pengguna')}</div>
 <p class="m" style="margin-top:12px">Hanya akun kasir yang dikelola di sini. Akun dengan peran lain diatur lewat Spreadsheet.</p>`;
 const form=async x=>{const e=!!x,v=await ask(e?'Ubah akun kasir':'Akun kasir baru',[
  {name:'full_name',label:'Nama lengkap',value:e?x.full_name:'',req:1,full:1},
  {name:'username',label:'Username',value:e?x.username:'',req:1,ro:e,pattern:'[a-z0-9._]{3,}',hint:e?'Username tidak dapat diubah':'Huruf kecil, angka, titik atau garis bawah'},
  {name:'password',label:e?'Password baru':'Password',type:'password',req:!e,hint:e?'Kosongkan jika tidak diganti':'Minimal 8 karakter'},
  {name:'tipe',label:'Tipe akun',value:e&&x.allowed==='*'?'pusat':'cabang',full:1,options:[['cabang','Kasir Cabang'],['pusat','Kasir Pusat']],hint:'Cabang: terkunci di satu cabang. Pusat: bisa membuka semua cabang.'},
  {name:'cabang',label:'Cabang',value:e&&x.allowed!=='*'?x.branch_id:BR[0].branch_id,options:BR.map(b=>[b.branch_id,b.branch_name]),hint:'Dipakai untuk Kasir Cabang'},
  {name:'status',label:'Status',value:e?x.status:'active',options:[['active','Aktif'],['inactive','Nonaktif']]}],e?'Simpan':'Buat akun');if(!v)return;
  const ps=v.tipe==='pusat',p={username:v.username,full_name:v.full_name,password:v.password,role_id:'R-KASIR',branch_id:ps?main:v.cabang,allowed_branch_ids:ps?'*':v.cabang,status:v.status};
  if(!p.password)delete p.password;
  try{await call('saveUser',p);toast(e?'Akun diperbarui':'Akun dibuat','ok');sUser()}catch(er){toast(er.message,'err')}};
 $('#nu').onclick=()=>form(null);$$('[data-u]').forEach(b=>b.onclick=()=>form(L.find(x=>x.user_id===b.dataset.u)))}
