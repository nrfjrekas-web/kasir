/* Struk thermal: isi #rc lalu dialog cetak browser. Nama usaha, penutup, lebar kertas dari Pengaturan > Struk */
function fillReceipt(r){const c=CFG.get(),rr=(a,b)=>`<div class="rr"><span>${a}</span><span>${b}</span></div>`;$('#rc').dataset.w=c.paper;
 $('#rc').innerHTML=`<div class="ct"><b>${E(c.name||r.branch)}</b><br>${E(r.invoice_number)}<br>${new Date(r.date).toLocaleString('id-ID')}<br>Kasir: ${E(r.cashier)}</div><hr>`+
 r.lines.map(l=>`${E(l.product_name)}${rr(l.qty+' x '+R(l.unit_price),R(l.total))}`).join('')+
 `<hr>${rr('Diskon',R(r.discount))}${rr('Pajak',R(r.tax))}<b>${rr('Total',R(r.grand_total))}</b>${rr('Bayar',R(r.paid))}${rr('Kembali',R(r.change))}<hr><div class="ct">${E(c.foot)}</div>`}
/* Setelah bayar: cetak langsung bila diaktifkan, atau tampilkan ringkasan dengan tombol cetak */
function receipt(r){fillReceipt(r);
 if(CFG.get().auto){toast('Transaksi '+r.invoice_number+' berhasil','ok');return print()}
 modal(`<div class="done">${ic('check',28)}<h3>Pembayaran berhasil</h3><p class="m">${E(r.invoice_number)}</p><dl class="kv"><dt>Total</dt><dd>${R(r.grand_total)}</dd><dt>Dibayar</dt><dd>${R(r.paid)}</dd><dt>Kembalian</dt><dd class="big">${R(r.change)}</dd></dl>
 <div class="acts" style="width:100%"><button data-x>Selesai</button><button class="p" id="pr">${ic('printer',18)}Cetak struk</button></div></div>`);$('#pr').onclick=()=>print()}
