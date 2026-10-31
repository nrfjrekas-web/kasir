// Uji asap tanpa browser dan tanpa Google: node tools/smoke.js
// 1) Memuat semua <script> index.html di node:vm (DOM tiruan). 2) Menjalankan backend/Code.gs dengan Spreadsheet tiruan di memori.
const vm=require('vm'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),rd=p=>fs.readFileSync(path.join(root,p),'utf8');
let bad=0;const ok=(n,c)=>{console.log((c?'LULUS  ':'GAGAL  ')+n);if(!c)bad++};

// ---------- Frontend ----------
const mk=()=>new Proxy({style:{},dataset:{},innerHTML:'',value:'',textContent:'',hidden:false},{get:(o,k)=>k in o?o[k]:(typeof k==='string'?()=>mk():undefined),set:(o,k,v)=>(o[k]=v,true)});
const els={},q=s=>els[s]||(els[s]=mk());
const fe={console,setTimeout,Promise,JSON,Math,Date,Set,alert(){},sessionStorage:{},localStorage:{},crypto:{randomUUID:()=>crypto.randomUUID()},
 indexedDB:{open:()=>({})},navigator:{onLine:true},addEventListener(){},print(){},scrollTo(){},document:{querySelector:q,querySelectorAll:()=>[]}};
vm.createContext(fe);
const order=[...rd('index.html').matchAll(/<script src="(js\/[^"]+)"/g)].map(m=>m[1]);
ok('semua skrip di index.html ada',order.every(p=>fs.existsSync(path.join(root,p))));
try{vm.runInContext(order.map(rd).join('\n'),fe);ok('semua skrip termuat tanpa error (tanpa deklarasi ganda)',true)}catch(e){console.log(e);ok('skrip termuat',false)}
ok('belum tersambung: tampil layar Sambungkan, bukan login',String(els['#app'].innerHTML).includes('Sambungkan'));
vm.runInContext("S.api='https://script.google.com/macros/s/x/exec';login()",fe);
ok('layar login hanya username dan password (tanpa URL/kode Apps Script)',String(els['#app'].innerHTML).includes('Masuk')&&!/URL|Apps Script/.test(els['#app'].innerHTML));
ok('hitung baris: 2x1000 - diskon 200 + pajak 10% = 1980',vm.runInContext("S.cart=[{p:{selling_price:1000,tax_type:'exclusive',tax_rate:10},qty:2,d:200}];tot()",fe)===1980);

// ---------- Backend ----------
const gs=rd('backend/Code.gs');
ok('Code.gs tanpa backtick, ${ atau backslash (syarat tombol salin)',!/`|\$\{|\\/.test(gs));
ok('gas-code.js sinkron dengan Code.gs',rd('js/features/gas-code.js').includes(gs.trimEnd()));
const mkSheet=()=>{const d=[];return{getLastRow:()=>d.length,getDataRange:()=>({getValues:()=>d.map(r=>r.slice())}),
 getRange:(r,c)=>{const g={setValues:v=>{v.forEach((row,i)=>{d[r-1+i]=d[r-1+i]||[];row.forEach((x,j)=>d[r-1+i][c-1+j]=x)});return g},setFontWeight:()=>g};return g},setFrozenRows(){}}};
const sh={},SS={getSheetByName:n=>sh[n]||null,insertSheet:n=>sh[n]=mkSheet(),deleteSheet(){}},cache={},props={};
const be={console,JSON,Math,Date,Set,Object,Array,String,Number,SpreadsheetApp:{getActiveSpreadsheet:()=>SS,openById:()=>SS},
 LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]==null?null:props[k],setProperty:(k,v)=>props[k]=v})},
 CacheService:{getScriptCache:()=>({get:k=>cache[k]==null?null:cache[k],put:(k,v)=>cache[k]=v,remove:k=>delete cache[k]})},Session:{getScriptTimeZone:()=>'Asia/Jakarta'},Logger:{log(){}},
 ContentService:{createTextOutput:s=>({s,setMimeType(){return this}}),MimeType:{JSON:1}},
 Utilities:{getUuid:()=>crypto.randomUUID(),base64Encode:b=>Buffer.from(b).toString('base64'),computeDigest:(a,s)=>[...crypto.createHash('sha256').update(s).digest()],DigestAlgorithm:{SHA_256:1},
  formatDate:(d,tz,f)=>{const i=new Date(d.getTime()+7*36e5).toISOString();return f==='yyyyMMdd'?i.slice(0,10).replace(/-/g,''):f==='yyMMdd'?i.slice(2,10).replace(/-/g,''):i.slice(0,10)}}};
vm.createContext(be);vm.runInContext(gs,be);
const A=(t,a,p)=>JSON.parse(be.api(t,a,p)),T=(t,a,p)=>{const r=A(t,a,p);if(!r.ok)throw new Error(r.error);return r.data};
const fails=(t,a,p,m)=>{const r=A(t,a,p);return !r.ok&&(!m||r.error.includes(m))};
const msg=be.initializeDatabase();ok('initializeDatabase membuat 24 sheet',Object.keys(sh).length===24);
const adm=T('','login',{username:'admin',password:msg.split('password: ')[1].split(' ')[0]}).token;
ok('login salah ditolak',fails('','login',{username:'admin',password:'salah'},'salah'));
const B='BR-PUSAT';
T(adm,'saveProduct',{sku:'A1',product_name:'Kopi',purchase_price:5000,selling_price:8000,min_stock:3,tax_type:'none',tax_rate:0,is_service:false});
const pid=T(adm,'getProducts',{}).find(x=>x.sku==='A1').product_id,stock=()=>T(adm,'getProducts',{branch_id:B}).find(x=>x.product_id===pid).stock;
ok('SKU ganda ditolak',fails(adm,'saveProduct',{sku:'A1',product_name:'Lain',purchase_price:1,selling_price:2},'SKU'));
const po=T(adm,'createPurchase',{branch_id:B,items:[{product_id:pid,qty:10,unit_cost:5000}]});T(adm,'receivePurchase',{purchase_id:po.purchase_id,paid:50000});
ok('penerimaan pembelian menambah stok jadi 10',stock()===10);
ok('penerimaan ganda ditolak',fails(adm,'receivePurchase',{purchase_id:po.purchase_id},'sudah'));
const tx=(id,qty,pay)=>({event_id:id,branch_id:B,items:[{product_id:pid,qty}],payments:[pay||{method:'cash',amount:qty*8000}]});
const r1=T(adm,'createTransaction',Object.assign(tx('E1',2),{payments:[{method:'cash',amount:20000}]}));
ok('transaksi: total 16000, kembalian 4000, stok 8',r1.grand_total===16000&&r1.change===4000&&stock()===8);
ok('nomor invoice berformat unik',/^INV\/PST\/\d{8}\/0001$/.test(r1.invoice_number));
ok('event_id sama tidak tercatat dua kali',T(adm,'createTransaction',tx('E1',2)).duplicate===true&&stock()===8);
ok('stok kurang ditolak',fails(adm,'createTransaction',tx('E9',99),'STOK_KURANG'));
ok('pembayaran kurang ditolak',fails(adm,'createTransaction',tx('E8',1,{method:'cash',amount:1000}),'kurang'));
ok('non-tunai tanpa referensi ditolak',fails(adm,'createTransaction',tx('E7',1,{method:'qris',amount:8000}),'referensi'));
const sy=T(adm,'syncOfflineTransactions',{events:[tx('E2',1),tx('E3',1,{method:'qris',amount:8000,ref:'X'}),tx('E4',50)]});
ok('sinkron: tunai berhasil, non-tunai offline gagal, stok kurang jadi konflik',sy[0].status==='done'&&sy[1].status==='gagal'&&sy[2].status==='konflik'&&stock()===7);
let rp=T(adm,'getReport',{});ok('laporan: 2 transaksi, omzet 24000, laba kotor 9000',rp.count===2&&rp.omzet===24000&&rp.gross_profit===9000);
T(adm,'cancelTransaction',{transaction_id:r1.transaction_id,reason:'uji'});
rp=T(adm,'getReport',{});ok('void mengembalikan stok (9) dan keluar dari laporan',stock()===9&&rp.count===1);
ok('void tanpa alasan ditolak',fails(adm,'cancelTransaction',{transaction_id:r1.transaction_id},'Alasan'));
ok('audit log terisi',T(adm,'getAuditLogs',{}).length>5);
T(adm,'saveUser',{username:'kasir1',password:'rahasia123',full_name:'Kasir Satu',role_id:'R-KASIR',branch_id:B,allowed_branch_ids:B});
const ks=T('','login',{username:'kasir1',password:'rahasia123'}).token;
ok('kasir tidak boleh mengubah produk/laporan',fails(ks,'saveProduct',{sku:'Z',product_name:'Z',purchase_price:1,selling_price:2},'izin')&&fails(ks,'getReport',{},'izin'));
ok('kasir ditolak di cabang yang tidak diizinkan',fails(ks,'createTransaction',Object.assign(tx('E5',1),{branch_id:'BR-X'}),'cabang'));
ok('kasir bisa menjual di cabangnya',T(ks,'createTransaction',tx('E6',1)).grand_total===8000);
T(adm,'saveUser',{username:'own',password:'rahasia123',full_name:'Owner',role_id:'R-OWNER',branch_id:B,allowed_branch_ids:'*'});
const ow=T('','login',{username:'own',password:'rahasia123'});
ok('Owner boleh atur server, kasir tidak',ow.user.perms.includes('server.setting')&&!T(ks,'me',{}).user.perms.includes('server.setting'));
ok('token tanpa sesi ditolak',fails('palsu','getProducts',{},'SESI_HABIS'));
for(let i=0;i<5;i++)A('','login',{username:'kasir1',password:'x'});
ok('login dibatasi setelah 5 kali salah',fails('','login',{username:'kasir1',password:'rahasia123'},'Terlalu banyak'));
console.log(bad?'\n'+bad+' GAGAL':'\nSemua lulus');process.exit(bad?1:0);
