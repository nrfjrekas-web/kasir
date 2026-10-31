/* Helper: selektor, format rupiah, escape HTML, pengaturan perangkat (tema, struk) */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],R=n=>'Rp'+Math.round(+n||0).toLocaleString('id-ID'),
E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const ini=n=>String(n||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const CFG0={theme:'auto',paper:'72',auto:false,name:'',foot:'Terima kasih'};
const CFG={get(){try{return Object.assign({},CFG0,JSON.parse(localStorage.cfg||'{}'))}catch(e){return Object.assign({},CFG0)}},
 set(o){localStorage.cfg=JSON.stringify(Object.assign(CFG.get(),o));applyTheme()}};
function applyTheme(){const h=document.documentElement,t=CFG.get().theme;if(!h)return;t==='auto'?h.removeAttribute('data-theme'):h.setAttribute('data-theme',t)}
