/* Pengaturan server (pemilik): ganti URL Web App, salin kode backend */
function server(){const fixed=!!API_URL;$('#v').innerHTML=`<div class="c"><h3>Server</h3><div class="f" style="grid-template-columns:1fr"><input id="api" value="${E(S.api)}" ${fixed?'disabled':''} autocapitalize="off">
 ${fixed?'<p class="m">URL diatur di js/core/config.js (API_URL) dan berlaku untuk semua perangkat.</p>':'<button class="p" id="sv">Simpan URL (perangkat ini)</button>'}<button id="cp">Salin kode Apps Script</button></div></div>`;
 $('#cp').onclick=copyGas;if(!fixed)$('#sv').onclick=()=>{const u=$('#api').value.trim();if(!/^https:\/\/script\.google\.com\/.+\/exec$/.test(u))return toast('URL Web App tidak valid');S.api=localStorage.api=u;toast('Tersimpan.')}}
