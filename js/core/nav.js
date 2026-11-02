/* Kerangka utama: sidebar (desktop) / tab bar bawah (Android), cabang, status, sinkron. Tab menurut izin */
const TABS=[['pos','Kasir','cart','sale.create'],['prod','Produk','box','product.write'],['stok','Stok','layers'],['lap','Laporan','chart','report.view'],['set','Pengaturan','gear']];
async function main(){const n=(await pend()).length,tabs=TABS.filter(t=>can(t[3]));
 if(!tabs.some(t=>t[0]===S.tab))S.tab=tabs[0][0];const cur=tabs.find(t=>t[0]===S.tab),on=navigator.onLine;
 const nav=c=>tabs.map(t=>`<button class="${c}${S.tab===t[0]?' on':''}" data-t="${t[0]}"${S.tab===t[0]?' aria-current="page"':''}>${ic(t[2],22)}<span>${t[1]}</span></button>`).join('');
 const br=S.B.length>1?`<label class="br">${ic('store',18)}<select id="br" aria-label="Cabang">${S.B.map(b=>`<option value="${E(b.branch_id)}"${b.branch_id===S.br?' selected':''}>${E(b.branch_name)}</option>`).join('')}</select></label>`
  :`<span class="br lock" title="Akun terkunci di cabang ini">${ic('store',18)}<span>${E(brName())}</span></span>`;
 $('#app').innerHTML=`<div class="app"><aside class="side"><div class="brand"><span class="logo">${ic('store',22)}</span>KASIR PRO</div><nav>${nav('nv')}</nav>
  <div class="me"><span class="av">${E(ini(S.u.full_name))}</span><div class="gr"><b>${E(S.u.full_name)}</b><span class="m">${E(tipe(S.u))}</span></div><button class="ib" id="lo" aria-label="Keluar" title="Keluar">${ic('logout',18)}</button></div></aside>
  <div class="col"><header class="top"><h1>${cur[1]}</h1><div class="tools">${br}<span class="net ${on?'on':'off'}"><i></i>${on?'Online':'Offline'}</span>
  <button class="sy" id="sy" aria-label="Sinkron">${ic('sync',18)}<span>Sinkron</span>${n?`<em>${n}</em>`:''}</button></div></header>
  ${on?'':'<div class="ob" role="status">Mode offline: transaksi tunai disimpan di perangkat dan dikirim saat online.</div>'}<main id="v"></main></div>
  <nav class="tabbar">${nav('tb')}</nav></div>`;
 if($('#br'))$('#br').onchange=async e=>{S.br=e.target.value;S.cart=[];await loadP();main()};
 $$('[data-t]').forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;main()});
 $('#lo').onclick=logout;$('#sy').onclick=()=>sync();
 const v=$('#v');v.className='';v.innerHTML=skel();
 try{await({pos,prod,stok,lap,set})[S.tab]()}catch(e){errView(e)}}
async function logout(){try{await call('logout')}catch(e){}sessionStorage.t='';S.tok='';S.u=null;S.cart=[];login()}
