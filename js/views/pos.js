// ---- Kasir ----
const line=i=>{const g=i.p.selling_price*i.qty,d=Math.min(+i.d||0,g),t=i.p.tax_type==='exclusive'?Math.round((g-d)*i.p.tax_rate/100):0;return{g,d,t,tot:g-d+t}};
const tot=()=>S.cart.reduce((a,i)=>a+line(i).tot,0);
const qtyN=()=>S.cart.reduce((a,i)=>a+i.qty,0);
const PM=[['cash','Tunai'],['qris','QRIS'],['transfer','Transfer'],['card','Kartu']];
function pos(){S.pm=S.pm||'cash';$('#v').className='pos-v';
 $('#v').innerHTML=`<div class="pos"><section class="pl-wrap"><div class="search">${ic('search',18)}<input id="s" type="search" enterkeyhint="search" placeholder="Cari nama, SKU, atau scan barcode" value="${E(S.q)}" autocomplete="off"></div><div class="pl" id="pl"></div></section>
 <aside class="cartp" id="kp" aria-label="Keranjang"><header class="cp-h"><h2>Keranjang</h2><span class="chip pri" id="cn" hidden></span><span class="grow"></span><button class="lnk d" id="cl">Kosongkan</button><button class="ib sheet-x" id="cx" aria-label="Tutup keranjang">${ic('x')}</button></header>
 <div class="cp-b" id="ct"></div>
 <footer class="cp-f"><div class="tot-l"><span class="m">Total</span><b id="tt"></b></div>
 <div class="seg" id="pm" role="radiogroup" aria-label="Metode bayar">${PM.map(m=>`<button role="radio" data-m="${m[0]}">${m[1]}</button>`).join('')}</div><div id="pf"></div>
 <p class="kb" id="kb"></p><button class="p lg" id="pay">Bayar</button></footer></aside></div>
 <button class="cartbar" id="cb">${ic('cart',20)}<span id="cbn"></span><b id="cbt"></b></button>`;
 $('#s').oninput=e=>{S.q=e.target.value;list()};
 $('#s').onkeydown=e=>{if(e.key==='Enter'){const q=S.q.trim().toLowerCase(),p=S.P.find(x=>String(x.barcode).toLowerCase()===q||String(x.sku).toLowerCase()===q);if(p&&q){add(p);S.q='';e.target.value='';list()}}};
 $('#cl').onclick=()=>{S.cart=[];cart()};$('#pay').onclick=pay;
 $('#cb').onclick=()=>$('#kp').classList.add('open');$('#cx').onclick=()=>$('#kp').classList.remove('open');
 $$('#pm button').forEach(b=>b.onclick=()=>{S.pm=b.dataset.m;payui()});
 if(matchMedia('(pointer:fine)').matches)$('#s').focus();list();cart();payui()}
function list(){const q=S.q.toLowerCase(),L=S.P.filter(p=>!q||(p.product_name+' '+p.sku+' '+p.barcode).toLowerCase().includes(q)).slice(0,80);
 $('#pl').innerHTML=L.map(p=>{const out=!p.is_service&&p.stock<=0,low=!p.is_service&&!out&&p.stock<=p.min_stock;
  return `<button class="pc" data-i="${E(p.product_id)}"${out?' disabled':''}><span class="pn">${E(p.product_name)}</span><span><span class="pp">${R(p.selling_price)}</span><br><span class="ps ${out?'out':low?'low':''}">${p.is_service?'Jasa':out?'Habis':'Stok '+p.stock}</span></span></button>`}).join('')
  ||(S.P.length?empty('search','Produk tidak ditemukan','Coba nama, SKU, atau barcode lain'):empty('box','Belum ada produk',can('product.write')?'Tambahkan produk lewat menu Produk':'Hubungi admin untuk menambah produk'));
 if($('#pl').style)$('#pl').style.display=L.length?'':'block';
 $$('#pl .pc').forEach(b=>b.onclick=()=>add(S.P.find(p=>p.product_id===b.dataset.i)))}
function add(p){const i=S.cart.find(x=>x.p.product_id===p.product_id);i?i.qty++:S.cart.push({p,qty:1,d:0});cart()}
function cart(){const n=qtyN(),T=tot();
 $('#ct').innerHTML=S.cart.map((i,k)=>`<div class="li"><div class="li-h"><div><b>${E(i.p.product_name)}</b><span class="m">${R(i.p.selling_price)}</span></div><span class="tot">${R(line(i).tot)}</span><button class="ib d" data-x="${k}" aria-label="Hapus ${E(i.p.product_name)}">${ic('trash',18)}</button></div>
  <div class="li-b"><div class="step"><button data-m="${k}" aria-label="Kurangi">−</button><input type="number" inputmode="numeric" min="1" value="${i.qty}" data-q="${k}" aria-label="Jumlah"><button data-p="${k}" aria-label="Tambah">+</button></div>
  <label class="dsc">Diskon<input type="number" inputmode="numeric" min="0" value="${i.d||''}" placeholder="0" data-d="${k}"></label></div></div>`).join('')
  ||empty('cart','Keranjang kosong','Pilih produk atau scan barcode');
 $('#tt').textContent=R(T);$('#cn').textContent=n+' item';$('#cn').hidden=!n;$('#cbn').textContent=n?n+' item':'Keranjang kosong';$('#cbt').textContent=n?R(T):'';$('#cb').disabled=!n;$('#cl').hidden=!n;
 if(!n)$('#kp').classList.remove('open');
 $$('[data-q]').forEach(e=>e.onchange=()=>{S.cart[e.dataset.q].qty=Math.max(1,+e.value||1);cart()});
 $$('[data-d]').forEach(e=>e.onchange=()=>{S.cart[e.dataset.d].d=Math.max(0,+e.value||0);cart()});
 $$('[data-p]').forEach(e=>e.onclick=()=>{S.cart[e.dataset.p].qty++;cart()});
 $$('[data-m]').forEach(e=>{if(e.closest('.step'))e.onclick=()=>{const i=S.cart[e.dataset.m];i.qty>1?i.qty--:S.cart.splice(e.dataset.m,1);cart()}});
 $$('[data-x]').forEach(e=>e.onclick=()=>{S.cart.splice(e.dataset.x,1);cart()});payui()}
/* Bagian bayar: metode, kolom dibayar / referensi, kembalian */
function payui(){const cash=S.pm==='cash',T=tot(),old=$('#am')?$('#am').value:'';
 $$('#pm button').forEach(b=>{b.classList.toggle('on',b.dataset.m===S.pm);b.setAttribute('aria-checked',b.dataset.m===S.pm)});
 $('#pf').innerHTML=`<label class="fl"><span>Dibayar</span><input id="am" type="number" inputmode="numeric" min="0" placeholder="0"></label>`+
  (cash?`<div class="quick"><button data-a="${T}">Uang pas</button>${[50000,100000].map(v=>`<button data-a="${v}">${R(v)}</button>`).join('')}</div>`:`<label class="fl" style="margin-top:8px"><span>No. referensi</span><input id="rf" placeholder="Wajib untuk non-tunai" autocomplete="off"></label>`);
 $('#am').value=T||'';$('#am').oninput=chg;$$('.quick button').forEach(b=>b.onclick=()=>{$('#am').value=b.dataset.a;chg()});chg()}
function chg(){const T=tot(),a=+$('#am').value||0,c=a-T;
 $('#kb').className='kb '+(!S.cart.length?'':c>=0?'ok':'lack');$('#kb').textContent=!S.cart.length?'':c>=0?'Kembalian: '+R(c):'Kurang: '+R(-c);
 $('#pay').disabled=!S.cart.length||a<T;$('#pay').textContent=S.cart.length?'Bayar '+R(T):'Bayar'}
async function pay(){if(!S.cart.length)return toast('Keranjang kosong','err');const m=S.pm,a=+$('#am').value||0;if(a<tot())return toast('Pembayaran kurang','err');
 const ev={event_id:crypto.randomUUID(),branch_id:S.br,items:S.cart.map(i=>({product_id:i.p.product_id,qty:i.qty,discount:i.d})),payments:[{method:m,amount:a,ref:$('#rf')?$('#rf').value:''}],offline_at:new Date().toISOString()};
 $('#pay').disabled=true;$('#pay').textContent='Memproses…';
 try{const r=await call('createTransaction',ev);S.cart=[];S.pm='cash';await loadP();await main();receipt(r)}
 catch(e){chg();
  if(e.net||!navigator.onLine){if(m!=='cash')return toast('Pembayaran non-tunai wajib online','err');await st('q','readwrite',s=>s.put(ev));S.cart=[];toast('Tersimpan offline. Akan dikirim saat online.','ok');main()}
  else if(e.message==='SESI_HABIS'){toast('Sesi habis, silakan masuk lagi','err');login()}else toast(e.message,'err')}}
