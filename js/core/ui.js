/* Komponen UI bersama: ikon SVG, toast, dialog (pengganti alert/prompt/confirm), kerangka loading/kosong/galat */
const IC={
cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
box:'<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
layers:'<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
chart:'<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
gear:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
sync:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
store:'<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/>',
edit:'<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>',
server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
printer:'<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
check:'<path d="M20 6 9 17l-5-5"/>',alert:'<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
eye:'<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>'};
const ic=(n,s)=>`<svg class="ic" width="${s||20}" height="${s||20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||''}</svg>`;

/* Toast (snackbar). Jenis: 'ok' | 'err' | kosong */
function toast(m,k){const h=$('#toasts');if(!h)return;const d=document.createElement('div');d.className='toast'+(k?' '+k:'');d.setAttribute('role',k==='err'?'alert':'status');d.textContent=m;h.appendChild(d);setTimeout(()=>d.remove(),k==='err'?6000:3000)}

/* Dialog: modal() isi bebas; ask() formulir; sure() konfirmasi. Di Android tampil sebagai bottom sheet */
const MD={cb:null};
function modal(html,onclose){const m=$('#md');MD.cb=onclose||null;m.innerHTML=`<div class="scrim" data-x></div><div class="dlg" role="dialog" aria-modal="true">${html}</div>`;
 m.onclick=e=>{if(e.target.closest('[data-x]'))closeModal()};const f=m.querySelector('input:not([readonly]),select');if(f&&matchMedia('(pointer:fine)').matches)f.focus()}
function closeModal(){const m=$('#md'),cb=MD.cb;MD.cb=null;m.innerHTML='';m.onclick=null;if(cb)cb()}
addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#md')&&$('#md').innerHTML)closeModal()});
function ask(title,fields,ok,note){return new Promise(res=>{
 const fld=f=>`<label class="fl${f.full?' full':''}"><span>${E(f.label)}</span>${f.options?`<select name="${f.name}">${f.options.map(o=>`<option value="${E(o[0])}"${String(o[0])===String(f.value)?' selected':''}>${E(o[1])}</option>`).join('')}</select>`
  :`<input name="${f.name}" type="${f.type||'text'}" value="${E(f.value==null?'':f.value)}" placeholder="${E(f.ph||'')}"${f.req?' required':''}${f.ro?' readonly':''}${f.pattern?` pattern="${f.pattern}"`:''}${f.min!=null?` min="${f.min}"`:''}${f.mode?` inputmode="${f.mode}"`:''}${f.type==='password'?' autocomplete="new-password"':' autocomplete="off"'} autocapitalize="off">`}${f.hint?`<small>${E(f.hint)}</small>`:''}</label>`;
 modal(`<h3>${E(title)}</h3>${note?`<p class="m">${E(note)}</p>`:''}<form id="mf" class="form">${fields.map(fld).join('')}<div class="acts full"><button type="button" data-x>Batal</button><button class="p" type="submit">${E(ok||'Simpan')}</button></div></form>`,()=>res(null));
 $('#mf').onsubmit=e=>{e.preventDefault();const v={};new FormData(e.target).forEach((x,k)=>v[k]=String(x).trim());MD.cb=null;closeModal();res(v)}})}
function sure(title,msg,ok,danger){return new Promise(res=>{modal(`<h3>${E(title)}</h3><p class="m">${E(msg)}</p><div class="acts"><button data-x>Batal</button><button class="${danger?'p dng':'p'}" id="yy">${E(ok||'Ya')}</button></div>`,()=>res(false));
 $('#yy').onclick=()=>{MD.cb=null;closeModal();res(true)}})}

/* Keadaan tampilan: memuat, kosong, galat */
const skel=()=>'<div class="sk"><i></i><i></i><i></i></div>';
const empty=(i,t,s)=>`<div class="empty">${ic(i,34)}<b>${E(t)}</b>${s?`<span>${E(s)}</span>`:''}</div>`;
function errView(e){if(e&&e.message==='SESI_HABIS'){toast('Sesi habis, silakan masuk lagi','err');return login()}
 $('#v').innerHTML=`<div class="empty err">${ic('alert',34)}<b>${e&&e.net?'Tidak ada koneksi ke server':'Gagal memuat'}</b><span>${E(e&&e.message||'')}</span><button class="p" id="rt">Coba lagi</button></div>`;$('#rt').onclick=main}
