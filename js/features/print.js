/* Struk thermal: isi #rc lalu dialog cetak browser (lebar diatur di css/style.css) */
function receipt(r){$('#rc').innerHTML=`<div style="text-align:center"><b>${E(r.branch)}</b><br>${E(r.invoice_number)}<br>${new Date(r.date).toLocaleString('id-ID')}<br>Kasir: ${E(r.cashier)}</div><hr>`+
 r.lines.map(l=>`${E(l.product_name)}<br>${l.qty} x ${R(l.unit_price)}<span style="float:right">${R(l.total)}</span><br>`).join('')+
 `<hr>Diskon<span style="float:right">${R(r.discount)}</span><br>Pajak<span style="float:right">${R(r.tax)}</span><br><b>Total<span style="float:right">${R(r.grand_total)}</span></b><br>Bayar<span style="float:right">${R(r.paid)}</span><br>Kembali<span style="float:right">${R(r.change)}</span><hr><div style="text-align:center">Terima kasih</div>`;
 if(confirm('Transaksi berhasil: '+r.invoice_number+'\nCetak struk?'))print()}
