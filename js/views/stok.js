// ---- Stok ----
async function stok(){const L=await call('getProducts',{branch_id:S.br});
 $('#v').innerHTML=`<div class="c sc"><h3>Stok cabang</h3><table><tr><th>Produk</th><th>Stok</th><th>Min</th><th></th></tr>${L.filter(p=>!p.is_service).map(p=>`<tr><td>${E(p.product_name)}</td><td>${p.stock<=p.min_stock?'<b style="color:var(--d)">'+p.stock+'</b>':p.stock}</td><td>${p.min_stock}</td>
 <td>${can('stock.write')?`<button data-a="${E(p.product_id)}">Opname</button> `:''}${can('purchase.write')?`<button data-m="${E(p.product_id)}">Barang masuk</button>`:''}</td></tr>`).join('')}</table></div>`;
 document.querySelectorAll('[data-a]').forEach(b=>b.onclick=async()=>{const q=prompt('Stok fisik hasil hitung:');if(q===null)return;try{await call('adjustStock',{branch_id:S.br,product_id:b.dataset.a,new_qty:q});stok()}catch(e){toast(e.message)}});
 document.querySelectorAll('[data-m]').forEach(b=>b.onclick=async()=>{const q=prompt('Jumlah barang diterima:');if(!q)return;const c=prompt('Harga beli per unit:');if(c===null)return;
  try{const r=await call('createPurchase',{branch_id:S.br,items:[{product_id:b.dataset.m,qty:q,unit_cost:c}]});await call('receivePurchase',{purchase_id:r.purchase_id,paid:q*c});await loadP();stok()}catch(e){toast(e.message)}})}

