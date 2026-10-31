// ---- Laporan ----
const bars=(o,fmt)=>{const k=Object.entries(o),mx=Math.max(1,...k.map(x=>x[1]));return k.map(([n,v])=>`<div class="item" style="display:block"><div class="row" style="justify-content:space-between"><span>${E(fmt?fmt(n):n)}</span><b class="num">${R(v)}</b></div><div class="bar"><i style="width:${Math.round(v/mx*100)}%"></i></div></div>`).join('')||'<p class="m">Belum ada data</p>'};
const MN={cash:'Tunai',qris:'QRIS',transfer:'Transfer',card:'Kartu'};
async function lap(){const t=today();
 $('#v').innerHTML=`<div class="c"><div class="filters"><label class="fl"><span>Dari</span><input type="date" id="fr" value="${S.lf||t}"></label><label class="fl"><span>Sampai</span><input type="date" id="to" value="${S.lt||t}"></label>
 <label class="fl"><span>Metode</span><select id="mt"><option value="">Semua metode</option>${Object.entries(MN).map(m=>`<option value="${m[0]}">${m[1]}</option>`).join('')}</select></label>
 <label class="fl"><span>Cabang</span><select id="lb">${S.B.length>1?'<option value="*">Semua cabang</option>':''}${S.B.map(b=>`<option value="${E(b.branch_id)}"${b.branch_id===S.br?' selected':''}>${E(b.branch_name)}</option>`).join('')}</select></label>
 <button class="p" id="ok">Tampilkan</button></div></div><div id="rs" style="margin-top:14px"></div>`;
 const go=async()=>{S.lf=$('#fr').value;S.lt=$('#to').value;$('#rs').innerHTML=skel();
  try{const bv=$('#lb').value,r=await call('getReport',{from:S.lf,to:S.lt,method:$('#mt').value,branch_id:bv==='*'?'':bv});
  $('#rs').innerHTML=`<div class="kpi"><div class="c"><small>Omzet</small><b>${R(r.omzet)}</b></div><div class="c"><small>Transaksi</small><b>${r.count}</b></div><div class="c"><small>Penjualan bersih</small><b>${R(r.net)}</b></div><div class="c"><small>Laba kotor</small><b style="color:var(--p)">${R(r.gross_profit)}</b></div></div>
  <div class="g2" style="margin-top:14px"><div class="c"><h3>Per metode</h3>${bars(r.byMethod,k=>MN[k]||k)}<h3 style="margin-top:16px">Per hari</h3>${bars(r.byDay)}<p class="m" style="margin-top:12px">HPP ${R(r.cogs)}</p></div>
  <div class="c"><h3>Terlaris</h3>${r.top.map(x=>`<div class="item"><div class="gr"><b>${E(x.name)}</b><span class="m">${x.qty} terjual</span></div><span class="num">${R(x.total)}</span></div>`).join('')||'<p class="m">Belum ada penjualan</p>'}
  <h3 style="margin-top:16px">Stok menipis</h3>${r.low.map(x=>`<div class="item"><div class="gr"><b>${E(x.product)}</b></div><span class="chip warn">${x.qty} / min ${x.min}</span></div>`).join('')||'<p class="m">Semua stok aman</p>'}</div></div>
  <div class="c" style="margin-top:14px"><h3>Transaksi</h3>${r.tx.map(x=>`<div class="item"><div class="gr"><b>${E(x.invoice_number)}</b><span class="m">${new Date(x.date).toLocaleString('id-ID')}</span></div><span class="num">${R(x.grand_total)}</span>${can('void')?`<button class="d" data-v="${E(x.transaction_id)}">Void</button>`:''}</div>`).join('')||empty('chart','Tidak ada transaksi','Ubah tanggal atau filter')}</div>`;
  $$('[data-v]').forEach(b=>b.onclick=async()=>{const v=await ask('Void transaksi',[{name:'why',label:'Alasan void',req:1,full:1}],'Void','Stok akan dikembalikan dan transaksi keluar dari laporan.');if(!v)return;
   try{await call('cancelTransaction',{transaction_id:b.dataset.v,reason:v.why});toast('Transaksi di-void','ok');go()}catch(e){toast(e.message,'err')}})}
  catch(e){$('#rs').innerHTML=`<div class="empty err">${ic('alert',34)}<b>Gagal memuat laporan</b><span>${E(e.message)}</span></div>`}};
 $('#ok').onclick=go;go()}
