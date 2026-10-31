// ---- Produk ----
async function prod(){const L=await call('getProducts',{all:1,branch_id:S.br});
 $('#v').innerHTML=`<div class="c"><h3>Produk</h3><div class="f" id="pf">${[['sku','SKU'],['barcode','Barcode'],['product_name','Nama'],['purchase_price','Harga beli'],['selling_price','Harga jual'],['min_stock','Stok min'],['tax_rate','Pajak %']].map(f=>`<input id="f_${f[0]}" placeholder="${f[1]}">`).join('')}
 <select id="f_tax_type"><option value="none">Tanpa pajak</option><option value="exclusive">Pajak ditambahkan</option></select><select id="f_is_service"><option value="false">Barang</option><option value="true">Jasa</option></select>
 <button class="p" id="sv">Simpan</button></div></div><div class="c sc" style="margin-top:12px"><table><tr><th>SKU</th><th>Nama</th><th>Beli</th><th>Jual</th><th>Stok</th><th>Status</th><th></th></tr>${L.map(p=>`<tr><td>${E(p.sku)}</td><td>${E(p.product_name)}</td><td>${R(p.purchase_price)}</td><td>${R(p.selling_price)}</td><td>${p.stock}</td><td>${E(p.status)}</td><td><button data-e="${E(p.product_id)}">Ubah</button></td></tr>`).join('')}</table></div>`;
 let id='';document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{const p=L.find(x=>x.product_id===b.dataset.e);id=p.product_id;['sku','barcode','product_name','purchase_price','selling_price','min_stock','tax_rate','tax_type','is_service'].forEach(k=>$('#f_'+k).value=p[k]);scrollTo(0,0)});
 $('#sv').onclick=async()=>{const p={product_id:id};['sku','barcode','product_name','purchase_price','selling_price','min_stock','tax_rate','tax_type','is_service'].forEach(k=>p[k]=$('#f_'+k).value);p.is_service=p.is_service==='true';
  try{await call('saveProduct',p);await loadP();prod()}catch(e){toast(e.message)}}}

