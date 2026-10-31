// ---- Produk ----
const PF=[['sku','SKU'],['barcode','Barcode'],['product_name','Nama produk',1],['purchase_price','Harga beli','n'],['selling_price','Harga jual','n'],['min_stock','Stok minimum','n'],['tax_rate','Pajak (%)','n']];
async function prod(){const L=await call('getProducts',{all:1,branch_id:S.br}),q=S.pq||'';
 const rows=L.filter(p=>!q||(p.product_name+' '+p.sku+' '+p.barcode).toLowerCase().includes(q.toLowerCase()));
 $('#v').innerHTML=`<div class="toolbar"><div class="search">${ic('search',18)}<input id="pq" type="search" placeholder="Cari produk…" value="${E(q)}"></div><button class="p" id="pn">${ic('plus',18)}Tambah produk</button></div>
 <div class="c">${rows.map(p=>`<div class="item"><div class="gr"><b>${E(p.product_name)}</b><span class="m">${E(p.sku||'—')} · beli ${R(p.purchase_price)}</span></div>
  <div class="r"><span class="num">${R(p.selling_price)}</span><br>${p.is_service?'<span class="chip">Jasa</span>':`<span class="chip ${p.stock<=0?'bad':p.stock<=p.min_stock?'warn':''}">Stok ${p.stock}</span>`}${p.status&&p.status!=='active'?' <span class="chip bad">Nonaktif</span>':''}</div>
  <button class="ib" data-e="${E(p.product_id)}" aria-label="Ubah ${E(p.product_name)}">${ic('edit',18)}</button></div>`).join('')||empty('box',L.length?'Produk tidak ditemukan':'Belum ada produk',L.length?'':'Tambahkan produk pertama Anda')}</div>`;
 $('#pq').oninput=e=>{S.pq=e.target.value;clearTimeout(S.pt);S.pt=setTimeout(prod,250)};
 $('#pn').onclick=()=>pform(null);$$('[data-e]').forEach(b=>b.onclick=()=>pform(L.find(x=>x.product_id===b.dataset.e)))}
async function pform(p){p=p||{tax_type:'none',is_service:false,tax_rate:0,min_stock:0};
 const f=PF.map(x=>({name:x[0],label:x[1],value:p[x[0]],type:x[2]==='n'?'number':'text',mode:x[2]==='n'?'numeric':'',min:x[2]==='n'?0:null,req:x[2]===1,full:x[2]===1}));
 f.push({name:'tax_type',label:'Pajak',value:p.tax_type,options:[['none','Tanpa pajak'],['exclusive','Pajak ditambahkan']]},{name:'is_service',label:'Jenis',value:String(!!p.is_service),options:[['false','Barang'],['true','Jasa']]});
 const v=await ask(p.product_id?'Ubah produk':'Produk baru',f,'Simpan');if(!v)return;
 v.product_id=p.product_id||'';v.is_service=v.is_service==='true';
 try{await call('saveProduct',v);await loadP();toast('Produk tersimpan','ok');prod()}catch(e){toast(e.message,'err')}}
