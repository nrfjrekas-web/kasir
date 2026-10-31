// ---- Stok ----
async function stok(){const L=(await call('getProducts',{branch_id:S.br})).filter(p=>!p.is_service),q=S.sq||'',low=L.filter(p=>p.stock<=p.min_stock).length;
 const rows=L.filter(p=>!q||(p.product_name+' '+p.sku).toLowerCase().includes(q.toLowerCase()));
 $('#v').innerHTML=`<div class="toolbar"><div class="search">${ic('search',18)}<input id="sq" type="search" placeholder="Cari di stok ${E(brName())}…" value="${E(q)}"></div>
 <span class="chip">${L.length} produk</span><span class="chip ${low?'warn':'pri'}">${low?low+' menipis':'Semua aman'}</span></div>
 <div class="c">${rows.map(p=>`<div class="item"><div class="gr"><b>${E(p.product_name)}</b><span class="m">Minimum ${p.min_stock}</span></div>
  <span class="chip ${p.stock<=0?'bad':p.stock<=p.min_stock?'warn':''}">${p.stock}</span>
  ${can('stock.write')?`<button data-a="${E(p.product_id)}">Opname</button>`:''}${can('purchase.write')?`<button class="p" data-m="${E(p.product_id)}">Masuk</button>`:''}</div>`).join('')||empty('layers',L.length?'Tidak ditemukan':'Belum ada barang berstok')}</div>`;
 $('#sq').oninput=e=>{S.sq=e.target.value;clearTimeout(S.pt);S.pt=setTimeout(stok,250)};
 const nm=id=>L.find(p=>p.product_id===id).product_name;
 $$('[data-a]').forEach(b=>b.onclick=async()=>{const v=await ask('Stok opname',[{name:'q',label:'Stok fisik hasil hitung — '+nm(b.dataset.a),type:'number',mode:'numeric',min:0,req:1,full:1}],'Simpan');if(!v)return;
  try{await call('adjustStock',{branch_id:S.br,product_id:b.dataset.a,new_qty:v.q});toast('Stok disesuaikan','ok');await loadP();stok()}catch(e){toast(e.message,'err')}});
 $$('[data-m]').forEach(b=>b.onclick=async()=>{const v=await ask('Barang masuk',[{name:'q',label:'Jumlah diterima',type:'number',mode:'numeric',min:1,req:1},{name:'c',label:'Harga beli per unit',type:'number',mode:'numeric',min:0,req:1}],'Terima barang','Produk: '+nm(b.dataset.m));if(!v)return;
  try{const r=await call('createPurchase',{branch_id:S.br,items:[{product_id:b.dataset.m,qty:v.q,unit_cost:v.c}]});await call('receivePurchase',{purchase_id:r.purchase_id,paid:v.q*v.c});await loadP();toast('Barang masuk dicatat','ok');stok()}catch(e){toast(e.message,'err')}})}
