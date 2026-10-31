/* Kerangka utama: header, tab menurut izin, pindah cabang */
async function main(){const n=(await pend()).length,tabs=[['pos','Kasir','sale.create'],['prod','Produk','product.write'],['stok','Stok'],['lap','Laporan','report.view'],['server','Server','server.setting']].filter(t=>can(t[2]));
 if(!tabs.some(t=>t[0]===S.tab))S.tab=tabs[0][0];
 $('#app').innerHTML=`<header><b>KASIR PRO</b><select id="br">${S.B.map(b=>`<option value="${E(b.branch_id)}" ${b.branch_id===S.br?'selected':''}>${E(b.branch_name)}</option>`).join('')}</select>
 <nav>${tabs.map(t=>`<button class="${S.tab===t[0]?'on':''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</nav>
 <span class="badge">${navigator.onLine?'Online':'Offline'}</span><button id="sy">Sinkron${n?' ('+n+')':''}</button><button id="lo">Keluar</button></header><main id="v"></main>`;
 $('#br').onchange=async e=>{S.br=e.target.value;S.cart=[];await loadP();main()};
 document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;main()});
 $('#lo').onclick=async()=>{try{await call('logout')}catch(e){}sessionStorage.t='';S.tok='';S.u=null;login()};$('#sy').onclick=sync;
 ({pos,prod,stok,lap,server})[S.tab]()}
