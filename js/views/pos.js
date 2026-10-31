// ---- Kasir ----
const line=i=>{const g=i.p.selling_price*i.qty,d=Math.min(+i.d||0,g),t=i.p.tax_type==='exclusive'?Math.round((g-d)*i.p.tax_rate/100):0;return{g,d,t,tot:g-d+t}};
const tot=()=>S.cart.reduce((a,i)=>a+line(i).tot,0);
function pos(){$('#v').innerHTML=`<div class="g"><div class="c"><input id="s" placeholder="Cari nama / SKU / scan barcode" style="width:100%" autofocus><div class="pl" id="pl"></div></div>
 <div class="c"><h3 style="margin:0 0 8px">Keranjang</h3><div class="sc"><table id="ct"></table></div><h2 class="r" id="tt"></h2>
 <div class="f"><select id="pm"><option value="cash">Tunai</option><option value="transfer">Transfer</option><option value="qris">QRIS</option><option value="card">Kartu</option></select>
 <input id="am" type="number" placeholder="Dibayar"><input id="rf" placeholder="No. referensi (non-tunai)"></div><p id="kb" class="m"></p>
 <div class="row"><button class="p" id="pay" style="flex:1">Bayar</button><button id="cl">Kosongkan</button></div></div></div>`;
 $('#s').oninput=e=>{S.q=e.target.value;list()};
 $('#s').onkeydown=e=>{if(e.key==='Enter'){const q=S.q.trim().toLowerCase(),p=S.P.find(x=>String(x.barcode).toLowerCase()===q||String(x.sku).toLowerCase()===q);if(p){add(p);S.q='';e.target.value='';list()}}};
 $('#cl').onclick=()=>{S.cart=[];cart()};$('#pay').onclick=pay;$('#am').oninput=chg;list();cart()}
function list(){const q=S.q.toLowerCase();$('#pl').innerHTML=S.P.filter(p=>!q||(p.product_name+p.sku+p.barcode).toLowerCase().includes(q)).slice(0,60)
 .map(p=>`<button data-i="${E(p.product_id)}"><b>${E(p.product_name)}</b><br>${R(p.selling_price)}<br><span class="m">${p.is_service?'Jasa':'Stok '+p.stock}</span></button>`).join('')||'<span class="m">Tidak ada produk</span>';
 document.querySelectorAll('#pl button').forEach(b=>b.onclick=()=>add(S.P.find(p=>p.product_id===b.dataset.i)))}
function add(p){const i=S.cart.find(x=>x.p.product_id===p.product_id);i?i.qty++:S.cart.push({p,qty:1,d:0});cart()}
function cart(){$('#ct').innerHTML='<tr><th>Item</th><th>Qty</th><th>Diskon</th><th class="r">Total</th><th></th></tr>'+S.cart.map((i,n)=>`<tr><td>${E(i.p.product_name)}<br><span class="m">${R(i.p.selling_price)}</span></td>
 <td><input type="number" min="1" value="${i.qty}" style="width:64px" data-q="${n}"></td><td><input type="number" min="0" value="${i.d}" style="width:84px" data-d="${n}"></td><td class="r">${R(line(i).tot)}</td><td><button class="d" data-x="${n}">×</button></td></tr>`).join('');
 $('#tt').textContent='Total '+R(tot());$('#am').value=tot()||'';chg();
 document.querySelectorAll('[data-q]').forEach(e=>e.onchange=()=>{S.cart[e.dataset.q].qty=Math.max(1,+e.value||1);cart()});
 document.querySelectorAll('[data-d]').forEach(e=>e.onchange=()=>{S.cart[e.dataset.d].d=Math.max(0,+e.value||0);cart()});
 document.querySelectorAll('[data-x]').forEach(e=>e.onclick=()=>{S.cart.splice(e.dataset.x,1);cart()})}
function chg(){const c=(+$('#am').value||0)-tot();$('#kb').textContent=c>=0?'Kembalian: '+R(c):'Kurang: '+R(-c)}
async function pay(){if(!S.cart.length)return toast('Keranjang kosong');const m=$('#pm').value,a=+$('#am').value||0;if(a<tot())return toast('Pembayaran kurang');
 const ev={event_id:crypto.randomUUID(),branch_id:S.br,items:S.cart.map(i=>({product_id:i.p.product_id,qty:i.qty,discount:i.d})),payments:[{method:m,amount:a,ref:$('#rf').value}],offline_at:new Date().toISOString()};
 $('#pay').disabled=true;
 try{const r=await call('createTransaction',ev);S.cart=[];receipt(r);await loadP();main()}
 catch(e){$('#pay').disabled=false;
  if(e.net||!navigator.onLine){if(m!=='cash')return toast('Pembayaran non-tunai wajib online');await st('q','readwrite',s=>s.put(ev));S.cart=[];toast('Tersimpan offline. Akan disinkronkan saat online.');main()}
  else if(e.message==='SESI_HABIS'){toast('Sesi habis, login ulang');login()}else toast(e.message)}}
