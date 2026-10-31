/* Helper: selektor, format rupiah, escape HTML, notifikasi */
const $=s=>document.querySelector(s),R=n=>'Rp'+Math.round(+n||0).toLocaleString('id-ID'),
E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=m=>alert(m);
