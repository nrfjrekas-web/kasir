/* Salinan backend/Code.gs untuk tombol "Salin kode Apps Script". Perbarui dengan: python3 tools/sync-gas.py */
const GAS=`// KASIR PRO - Backend Google Apps Script (API JSON)
// 1) Buat Spreadsheet kosong > Extensions > Apps Script, tempel seluruh kode ini.
// 2) Jalankan initializeDatabase() sekali (setujui izin). Login awal tampil di log eksekusi.
// 3) Set zona waktu proyek ke Asia/Jakarta, lalu Deploy > Aplikasi web: jalankan sebagai Saya, akses Siapa saja.
// 4) Salin URL Web App ke layar login aplikasi.

// ===== Konfigurasi: definisi 24 sheet dan role =====
const SHEETS = {
  Users:'user_id,username,password_hash,full_name,email,phone,role_id,branch_id,allowed_branch_ids,status,last_login,created_at,updated_at',
  Roles:'role_id,role_name,permissions,description,status',
  Branches:'branch_id,branch_code,branch_name,address,phone,email,manager_id,is_main,status,created_at',
  Settings:'setting_id,branch_id,setting_key,setting_value,description,updated_at',
  Products:'product_id,sku,barcode,product_name,category_id,unit_id,description,image_url,purchase_price,selling_price,min_stock,tax_type,tax_rate,is_service,status,created_at,updated_at',
  Categories:'category_id,category_name,description,status,created_at',
  Units:'unit_id,unit_name,unit_symbol,status',
  Branch_Stock:'stock_id,branch_id,product_id,stock_qty,reserved_qty,available_qty,average_cost,last_stock_update',
  Customers:'customer_id,customer_code,customer_name,phone,email,address,customer_type,credit_limit,status,created_at',
  Suppliers:'supplier_id,supplier_code,supplier_name,phone,email,address,contact_person,status,created_at',
  Transactions:'transaction_id,invoice_number,branch_id,user_id,customer_id,transaction_date,subtotal,discount,tax_amount,grand_total,paid_amount,change_amount,payment_status,transaction_status,notes,device_id,created_at',
  Transaction_Details:'detail_id,transaction_id,product_id,product_name,sku,qty,unit_price,cost_price,discount,tax_amount,subtotal,total',
  Payments:'payment_id,transaction_id,branch_id,payment_method,payment_amount,reference_number,payment_date,payment_status',
  Purchases:'purchase_id,purchase_number,branch_id,supplier_id,user_id,purchase_date,subtotal,discount,tax_amount,grand_total,paid_amount,payment_status,purchase_status,notes',
  Purchase_Details:'detail_id,purchase_id,product_id,qty,unit_cost,discount,tax_amount,subtotal,total',
  Stock_Movements:'movement_id,branch_id,product_id,movement_type,reference_type,reference_id,qty_in,qty_out,stock_before,stock_after,movement_date,user_id,notes',
  Stock_Transfers:'transfer_id,transfer_number,from_branch_id,to_branch_id,transfer_date,user_id,transfer_status,notes,created_at,received_at',
  Stock_Transfer_Details:'detail_id,transfer_id,product_id,qty_sent,qty_received,notes',
  Expenses:'expense_id,branch_id,expense_category,description,amount,expense_date,payment_method,user_id,attachment_url,created_at',
  Cash_Shifts:'shift_id,branch_id,user_id,register_id,opening_cash,closing_cash,expected_cash,cash_difference,total_cash_sales,total_cash_in,total_cash_out,opened_at,closed_at,shift_status',
  Returns:'return_id,return_number,transaction_id,branch_id,user_id,return_date,return_type,return_total,refund_method,return_status,notes',
  Return_Details:'detail_id,return_id,product_id,qty,unit_price,subtotal,stock_condition',
  Audit_Logs:'log_id,user_id,branch_id,action,module,record_id,old_value,new_value,ip_or_device,created_at',
  Sync_Queue:'sync_id,event_id,device_id,branch_id,user_id,event_type,local_reference,payload_json,created_at,synced_at,sync_status,retry_count,error_message'
};
const ROLES = [['R-SUPER','Super Admin','*'],['R-OWNER','Owner','report.view,audit.view,server.setting'],
  ['R-ADMIN','Admin Pusat','product.write,user.manage,report.view,stock.write'],
  ['R-MGR','Manager Cabang','sale.create,void,report.view,stock.write,purchase.write,product.write'],
  ['R-GUDANG','Kepala Gudang','stock.write,purchase.write'],['R-KASIR','Kasir','sale.create'],
  ['R-AUDIT','Auditor','report.view,audit.view']];

// ===== Akses Spreadsheet, audit log, inisialisasi =====
// ---------- Util database ----------
const H_ = n => SHEETS[n].split(',');
const iso_ = () => new Date().toISOString();
const id_ = p => p + '-' + Utilities.getUuid().slice(0, 8).toUpperCase();
function db_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}
function all_(n) {
  const v = db_().getSheetByName(n).getDataRange().getValues(), h = v.shift();
  return v.map((r, i) => { const o = { _row: i + 2 }; h.forEach((k, j) => o[k] = r[j]); return o; });
}
function add_(n, list) {
  list = [].concat(list); if (!list.length) return;
  const s = db_().getSheetByName(n), h = H_(n);
  s.getRange(s.getLastRow() + 1, 1, list.length, h.length)
    .setValues(list.map(o => h.map(k => o[k] === undefined ? '' : o[k])));
}
function set_(n, o) {
  const h = H_(n); db_().getSheetByName(n).getRange(o._row, 1, 1, h.length)
    .setValues([h.map(k => o[k] === undefined ? '' : o[k])]);
}
function log_(u, action, module, rec, oldV, newV, branch) {
  add_('Audit_Logs', { log_id: id_('LOG'), user_id: u.user_id, branch_id: branch || u.branch_id, action, module,
    record_id: rec, old_value: oldV ? JSON.stringify(oldV).slice(0, 4000) : '', new_value: newV ? JSON.stringify(newV).slice(0, 4000) : '',
    ip_or_device: u.device || 'web', created_at: iso_() });
}

// ---------- Inisialisasi ----------
function initializeDatabase() {
  const ss = db_();
  Object.keys(SHEETS).forEach(n => {
    const s = ss.getSheetByName(n) || ss.insertSheet(n);
    if (s.getLastRow() === 0) { s.getRange(1, 1, 1, H_(n).length).setValues([H_(n)]).setFontWeight('bold'); s.setFrozenRows(1); }
  });
  const d = ss.getSheetByName('Sheet1'); if (d && d.getLastRow() === 0) ss.deleteSheet(d);
  if (!all_('Roles').length) add_('Roles', ROLES.map(r => ({ role_id: r[0], role_name: r[1], permissions: r[2], status: 'active' })));
  let msg = 'Database sudah ada.';
  if (!all_('Users').length) {
    add_('Branches', { branch_id: 'BR-PUSAT', branch_code: 'PST', branch_name: 'Pusat', is_main: true, status: 'active', created_at: iso_() });
    add_('Categories', { category_id: 'CAT-UMUM', category_name: 'Umum', status: 'active', created_at: iso_() });
    add_('Units', { unit_id: 'UNIT-PCS', unit_name: 'Pcs', unit_symbol: 'pcs', status: 'active' });
    const pw = Utilities.getUuid().slice(0, 10);
    saveUser_({ user_id: 'SYSTEM' }, { username: 'admin', password: pw, full_name: 'Super Admin', role_id: 'R-SUPER', branch_id: 'BR-PUSAT', allowed_branch_ids: '*' });
    msg = 'Login awal -> username: admin, password: ' + pw + ' (segera ganti)';
  }
  Logger.log(msg); return msg;
}

// ===== Autentikasi, sesi, hak akses, pengguna =====
// ---------- Auth ----------
function hash_(pw, salt) {
  let h = salt + pw;
  for (let i = 0; i < 3000; i++) h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + h));
  return h;
}
function saveUser_(u, p) {
  if (!p.username || !p.full_name || !p.role_id) throw new Error('Data pengguna tidak lengkap');
  const ex = all_('Users').find(x => x.username === p.username);
  const PRIV = ['R-SUPER', 'R-OWNER', 'R-ADMIN'];
  if (u.perms && !u.perms.includes('*') && (PRIV.includes(p.role_id) || (ex && PRIV.includes(ex.role_id)))) throw new Error('Tidak boleh mengelola akun dengan role ini');
  if (p.branch_id !== undefined && p.branch_id && !all_('Branches').find(b => b.branch_id === p.branch_id)) throw new Error('Cabang tidak ditemukan');
  const salt = Utilities.getUuid().slice(0, 12);
  const row = ex || { user_id: id_('USR'), created_at: iso_(), status: 'active' };
  ['full_name', 'email', 'phone', 'role_id', 'branch_id', 'allowed_branch_ids', 'status'].forEach(k => { if (p[k] !== undefined) row[k] = p[k]; });
  row.username = p.username; row.updated_at = iso_();
  if (p.password) { if (p.password.length < 8) throw new Error('Password minimal 8 karakter'); row.password_hash = salt + '$' + hash_(p.password, salt); }
  else if (!ex) throw new Error('Password wajib');
  ex ? set_('Users', row) : add_('Users', row);
  log_(u, ex ? 'update' : 'create', 'Users', row.user_id, null, { username: row.username, role_id: row.role_id });
  return { user_id: row.user_id };
}
function listUsers_(u) {
  const RN = {}; all_('Roles').forEach(r => RN[r.role_id] = r.role_name);
  return all_('Users').map(x => ({ user_id: x.user_id, username: x.username, full_name: x.full_name, role_id: x.role_id, role: RN[x.role_id] || '',
    branch_id: x.branch_id, allowed: String(x.allowed_branch_ids || x.branch_id), status: x.status, last_login: x.last_login }));
}
function listBranches_(u) {
  return all_('Branches').filter(b => b.status === 'active').map(b => ({ branch_id: b.branch_id, branch_name: b.branch_name, is_main: String(b.is_main).toLowerCase() === 'true' }));
}
function changePassword_(u, p) {
  const x = all_('Users').find(y => y.user_id === u.user_id);
  if (!x) throw new Error('Akun tidak ditemukan');
  const old = String(x.password_hash).split('$');
  if (hash_(p.old_password || '', old[0]) !== old[1]) throw new Error('Password lama salah');
  if (!p.new_password || p.new_password.length < 8) throw new Error('Password baru minimal 8 karakter');
  const salt = Utilities.getUuid().slice(0, 12);
  x.password_hash = salt + '$' + hash_(p.new_password, salt); x.updated_at = iso_(); set_('Users', x);
  log_(u, 'password', 'Users', x.user_id);
  return {};
}
function login_(p) {
  const c = CacheService.getScriptCache(), k = 'try_' + p.username, n = +c.get(k) || 0;
  if (n >= 5) throw new Error('Terlalu banyak percobaan. Coba lagi 10 menit lagi.');
  const u = all_('Users').find(x => x.username === p.username && x.status === 'active');
  const ok = u && (() => { const [salt, h] = String(u.password_hash).split('$'); return hash_(p.password || '', salt) === h; })();
  if (!ok) { c.put(k, String(n + 1), 600); throw new Error('Username atau password salah'); }
  c.remove(k);
  const role = all_('Roles').find(r => r.role_id === u.role_id);
  const sess = { user_id: u.user_id, username: u.username, full_name: u.full_name, branch_id: u.branch_id,
    allowed: String(u.allowed_branch_ids || u.branch_id), role: role ? role.role_name : '', perms: role ? String(role.permissions).split(',') : [], device: p.device_id || 'web' };
  const token = Utilities.getUuid() + Utilities.getUuid();
  c.put('s_' + token, JSON.stringify(sess), 21600);
  u.last_login = iso_(); set_('Users', u); log_(sess, 'login', 'Auth', u.user_id);
  return { token, user: sess };
}
const can_ = (u, perm) => !perm || u.perms.includes('*') || u.perms.includes(perm);
function br_(u, b) {
  if (u.perms.includes('*') || u.allowed === '*' || u.allowed.split(',').includes(String(b))) return;
  throw new Error('Tidak punya akses ke cabang ini');
}

// ===== Layanan stok =====
// ---------- Stok ----------
function stk_(ST, b, pid, delta, type, rt, rid, uid, note, cost) {
  let r = ST.find(x => x.product_id === pid); const before = r ? +r.stock_qty : 0, after = before + delta;
  if (after < 0) throw new Error('STOK_KURANG: ' + pid);
  if (!r) {
    r = { stock_id: id_('STK'), branch_id: b, product_id: pid, stock_qty: after, reserved_qty: 0, available_qty: after, average_cost: cost || 0, last_stock_update: iso_() };
    add_('Branch_Stock', r); ST.push(r);
  } else {
    if (delta > 0 && cost != null) r.average_cost = after > 0 ? (before * (+r.average_cost || 0) + delta * cost) / after : cost;
    r.stock_qty = after; r.available_qty = after - (+r.reserved_qty || 0); r.last_stock_update = iso_(); set_('Branch_Stock', r);
  }
  return { movement_id: id_('MOV'), branch_id: b, product_id: pid, movement_type: type, reference_type: rt, reference_id: rid,
    qty_in: delta > 0 ? delta : 0, qty_out: delta < 0 ? -delta : 0, stock_before: before, stock_after: after, movement_date: iso_(), user_id: uid, notes: note || '' };
}
const lock_ = f => { const l = LockService.getScriptLock(); l.waitLock(20000); try { return f(); } finally { l.releaseLock(); } };

// ===== Layanan produk dan opname =====
// ---------- Produk ----------
function getProducts_(u, p) {
  const st = {}; if (p.branch_id) { br_(u, p.branch_id); all_('Branch_Stock').filter(s => s.branch_id === p.branch_id).forEach(s => st[s.product_id] = +s.available_qty); }
  return all_('Products').filter(x => p.all || x.status === 'active').map(x => { delete x._row; x.stock = st[x.product_id] || 0; return x; });
}
function saveProduct_(u, p) {
  if (!p.sku || !p.product_name) throw new Error('SKU dan nama wajib');
  if (!(+p.selling_price >= 0) || !(+p.purchase_price >= 0)) throw new Error('Harga tidak valid');
  return lock_(() => {
    const L = all_('Products'), ex = p.product_id && L.find(x => x.product_id === p.product_id);
    if (L.some(x => String(x.sku) === String(p.sku) && x.product_id !== p.product_id)) throw new Error('SKU sudah dipakai');
    const row = ex || { product_id: id_('PRD'), created_at: iso_(), status: 'active', category_id: 'CAT-UMUM', unit_id: 'UNIT-PCS' }, old = ex ? Object.assign({}, ex) : null;
    ['sku', 'barcode', 'product_name', 'category_id', 'unit_id', 'description', 'image_url', 'purchase_price', 'selling_price', 'min_stock', 'tax_type', 'tax_rate', 'is_service', 'status']
      .forEach(k => { if (p[k] !== undefined) row[k] = p[k]; });
    row.tax_type = row.tax_type || 'none'; row.tax_rate = +row.tax_rate || 0; row.updated_at = iso_();
    ex ? set_('Products', row) : add_('Products', row);
    log_(u, ex ? 'update' : 'create', 'Products', row.product_id, old, row); return { product_id: row.product_id };
  });
}
function adjustStock_(u, p) { // stok opname / penyesuaian
  br_(u, p.branch_id); if (!(+p.new_qty >= 0)) throw new Error('Qty tidak valid');
  return lock_(() => {
    const ST = all_('Branch_Stock').filter(s => s.branch_id === p.branch_id), r = ST.find(s => s.product_id === p.product_id);
    const mv = stk_(ST, p.branch_id, p.product_id, +p.new_qty - (r ? +r.stock_qty : 0), 'adjustment', 'opname', '', u.user_id, p.notes || 'Penyesuaian');
    add_('Stock_Movements', mv); log_(u, 'adjust', 'Stock', p.product_id, null, mv, p.branch_id); return mv;
  });
}

// ===== Layanan transaksi penjualan dan void =====
// ---------- Transaksi penjualan ----------
function createTx_(u, p) {
  br_(u, p.branch_id);
  if (!p.event_id) throw new Error('event_id (idempotency key) wajib');
  if (!p.items || !p.items.length) throw new Error('Keranjang kosong');
  if (!p.payments || !p.payments.length) throw new Error('Pembayaran kosong');
  return lock_(() => {
    const dup = all_('Sync_Queue').find(q => q.event_id === p.event_id && q.sync_status === 'done');
    if (dup) return { duplicate: true, transaction_id: dup.local_reference };
    const br = all_('Branches').find(b => b.branch_id === p.branch_id && b.status === 'active'); if (!br) throw new Error('Cabang tidak aktif');
    const PM = {}; all_('Products').forEach(x => PM[x.product_id] = x);
    const ST = all_('Branch_Stock').filter(s => s.branch_id === p.branch_id);
    let sub = 0, disc = 0, tax = 0; const det = [], need = {}, tid = id_('TRX');
    p.items.forEach(it => {
      const pr = PM[it.product_id], qty = +it.qty;
      if (!pr || pr.status !== 'active') throw new Error('Produk tidak valid');
      if (!(qty > 0)) throw new Error('Qty tidak valid');
      const gross = pr.selling_price * qty, d = Math.min(Math.max(+it.discount || 0, 0), gross), net = gross - d;
      const t = pr.tax_type === 'exclusive' ? Math.round(net * pr.tax_rate / 100) : 0;
      sub += gross; disc += d; tax += t;
      if (!pr.is_service) need[pr.product_id] = (need[pr.product_id] || 0) + qty;
      const st = ST.find(s => s.product_id === pr.product_id);
      det.push({ detail_id: id_('TD'), transaction_id: tid, product_id: pr.product_id, product_name: pr.product_name, sku: pr.sku, qty,
        unit_price: pr.selling_price, cost_price: st && +st.average_cost ? +st.average_cost : pr.purchase_price, discount: d, tax_amount: t, subtotal: gross, total: net + t });
    });
    Object.keys(need).forEach(pid => { const s = ST.find(x => x.product_id === pid); if (!s || +s.available_qty < need[pid]) throw new Error('STOK_KURANG: ' + PM[pid].product_name); });
    const grand = sub - disc + tax;
    let paid = 0; p.payments.forEach(y => {
      if (!['cash', 'transfer', 'qris', 'card'].includes(y.method) || !(+y.amount > 0)) throw new Error('Pembayaran tidak valid');
      if (y.method !== 'cash' && !y.ref) throw new Error('Nomor referensi wajib untuk non-tunai');
      if (y.method !== 'cash' && p.offline) throw new Error('Pembayaran non-tunai wajib diverifikasi online');
      paid += +y.amount;
    });
    if (paid < grand) throw new Error('Pembayaran kurang Rp' + (grand - paid));
    const change = paid - grand, cashSum = p.payments.filter(y => y.method === 'cash').reduce((a, y) => a + +y.amount, 0);
    if (change > cashSum) throw new Error('Kembalian hanya dari tunai');
    const day = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd'), sp = PropertiesService.getScriptProperties(), key = 'inv_' + day;
    const seq = (+sp.getProperty(key) || 0) + 1; sp.setProperty(key, String(seq));
    const inv = 'INV/' + br.branch_code + '/' + day + '/' + ('0000' + seq).slice(-4), when = p.offline_at || iso_();
    add_('Transactions', { transaction_id: tid, invoice_number: inv, branch_id: p.branch_id, user_id: u.user_id, customer_id: p.customer_id || '', transaction_date: when,
      subtotal: sub, discount: disc, tax_amount: tax, grand_total: grand, paid_amount: paid, change_amount: change, payment_status: 'paid', transaction_status: 'completed',
      notes: p.notes || '', device_id: u.device, created_at: iso_() });
    add_('Transaction_Details', det);
    let ch = change; add_('Payments', p.payments.map(y => { let a = +y.amount; if (y.method === 'cash' && ch > 0) { const c = Math.min(ch, a); a -= c; ch -= c; }
      return { payment_id: id_('PAY'), transaction_id: tid, branch_id: p.branch_id, payment_method: y.method, payment_amount: a, reference_number: y.ref || '', payment_date: when, payment_status: 'paid' }; }));
    const mv = []; Object.keys(need).forEach(pid => mv.push(stk_(ST, p.branch_id, pid, -need[pid], 'sale', 'transaction', tid, u.user_id, inv)));
    add_('Stock_Movements', mv);
    add_('Sync_Queue', { sync_id: id_('SYN'), event_id: p.event_id, device_id: u.device, branch_id: p.branch_id, user_id: u.user_id, event_type: 'sale', local_reference: tid,
      created_at: iso_(), synced_at: iso_(), sync_status: 'done', retry_count: 0 });
    log_(u, 'create', 'Transactions', tid, null, { inv, grand }, p.branch_id);
    return { transaction_id: tid, invoice_number: inv, date: when, branch: br.branch_name, cashier: u.full_name, lines: det, subtotal: sub, discount: disc, tax, grand_total: grand, paid, change };
  });
}
function voidTx_(u, p) {
  if (!p.reason) throw new Error('Alasan void wajib');
  return lock_(() => {
    const t = all_('Transactions').find(x => x.transaction_id === p.transaction_id);
    if (!t) throw new Error('Transaksi tidak ditemukan'); br_(u, t.branch_id);
    if (t.transaction_status !== 'completed') throw new Error('Transaksi tidak bisa di-void');
    const PM = {}; all_('Products').forEach(x => PM[x.product_id] = x);
    const ST = all_('Branch_Stock').filter(s => s.branch_id === t.branch_id), mv = [];
    all_('Transaction_Details').filter(d => d.transaction_id === t.transaction_id && PM[d.product_id] && !PM[d.product_id].is_service)
      .forEach(d => mv.push(stk_(ST, t.branch_id, d.product_id, +d.qty, 'void_in', 'void', t.transaction_id, u.user_id, p.reason)));
    add_('Stock_Movements', mv);
    all_('Payments').filter(x => x.transaction_id === t.transaction_id).forEach(x => { x.payment_status = 'void'; set_('Payments', x); });
    const old = { s: t.transaction_status }; t.transaction_status = 'void'; t.notes = (t.notes ? t.notes + ' | ' : '') + 'VOID: ' + p.reason; set_('Transactions', t);
    log_(u, 'void', 'Transactions', t.transaction_id, old, { reason: p.reason }, t.branch_id); return { ok: true };
  });
}

// ===== Sinkronisasi transaksi offline =====
function sync_(u, p) { // sinkronisasi antrean offline
  return (p.events || []).map(e => {
    try { const r = createTx_(u, Object.assign({}, e, { offline: true })); return { event_id: e.event_id, status: r.duplicate ? 'duplicate' : 'done', transaction_id: r.transaction_id, invoice_number: r.invoice_number }; }
    catch (err) {
      const msg = String(err.message), conflict = msg.indexOf('STOK_KURANG') === 0;
      add_('Sync_Queue', { sync_id: id_('SYN'), event_id: e.event_id, device_id: u.device, branch_id: e.branch_id, user_id: u.user_id, event_type: 'sale', local_reference: '',
        payload_json: JSON.stringify(e).slice(0, 40000), created_at: iso_(), sync_status: conflict ? 'konflik' : 'gagal', retry_count: 1, error_message: msg });
      return { event_id: e.event_id, status: conflict ? 'konflik' : 'gagal', error: msg };
    }
  });
}

// ===== Layanan pembelian =====
// ---------- Pembelian ----------
function createPurchase_(u, p) {
  br_(u, p.branch_id); if (!p.items || !p.items.length) throw new Error('Item kosong');
  let sub = 0; const pid = id_('PUR'), det = p.items.map(i => { if (!(+i.qty > 0) || !(+i.unit_cost >= 0)) throw new Error('Item tidak valid');
    const t = i.qty * i.unit_cost; sub += t; return { detail_id: id_('PD'), purchase_id: pid, product_id: i.product_id, qty: +i.qty, unit_cost: +i.unit_cost, subtotal: t, total: t }; });
  add_('Purchases', { purchase_id: pid, purchase_number: 'PO/' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMdd') + '/' + pid.slice(-4), branch_id: p.branch_id, supplier_id: p.supplier_id || '',
    user_id: u.user_id, purchase_date: iso_(), subtotal: sub, grand_total: sub, paid_amount: 0, payment_status: 'unpaid', purchase_status: 'draft', notes: p.notes || '' });
  add_('Purchase_Details', det); log_(u, 'create', 'Purchases', pid, null, { sub }, p.branch_id); return { purchase_id: pid };
}
function receivePurchase_(u, p) {
  return lock_(() => {
    const pu = all_('Purchases').find(x => x.purchase_id === p.purchase_id); if (!pu) throw new Error('Pembelian tidak ditemukan'); br_(u, pu.branch_id);
    if (pu.purchase_status !== 'draft') throw new Error('Pembelian sudah diproses');
    const ST = all_('Branch_Stock').filter(s => s.branch_id === pu.branch_id), mv = [];
    all_('Purchase_Details').filter(d => d.purchase_id === pu.purchase_id).forEach(d => mv.push(stk_(ST, pu.branch_id, d.product_id, +d.qty, 'purchase_in', 'purchase', pu.purchase_id, u.user_id, pu.purchase_number, +d.unit_cost)));
    add_('Stock_Movements', mv); pu.purchase_status = 'received'; pu.paid_amount = Math.min(+p.paid || 0, pu.grand_total);
    pu.payment_status = pu.paid_amount >= pu.grand_total ? 'paid' : pu.paid_amount > 0 ? 'partial' : 'unpaid'; set_('Purchases', pu);
    log_(u, 'receive', 'Purchases', pu.purchase_id, null, { paid: pu.paid_amount }, pu.branch_id); return { ok: true };
  });
}

// ===== Layanan laporan =====
// ---------- Laporan ----------
function report_(u, p) {
  const al = u.perms.includes('*') || u.allowed === '*' ? null : u.allowed.split(','), tz = Session.getScriptTimeZone();
  const f = new Date((p.from || '2000-01-01') + 'T00:00:00'), t = new Date((p.to || '2999-12-31') + 'T23:59:59');
  let tx = all_('Transactions').filter(x => x.transaction_status === 'completed' && (!al || al.includes(x.branch_id)) && (!p.branch_id || x.branch_id === p.branch_id) &&
    (!p.user_id || x.user_id === p.user_id) && new Date(x.transaction_date) >= f && new Date(x.transaction_date) <= t);
  let ids = new Set(tx.map(x => x.transaction_id)), pays = all_('Payments').filter(x => ids.has(x.transaction_id) && (!p.method || x.payment_method === p.method));
  if (p.method) { const s = new Set(pays.map(x => x.transaction_id)); tx = tx.filter(x => s.has(x.transaction_id)); ids = s; }
  const det = all_('Transaction_Details').filter(d => ids.has(d.transaction_id)), byM = {}, byD = {}, top = {};
  pays.forEach(x => byM[x.payment_method] = (byM[x.payment_method] || 0) + +x.payment_amount);
  tx.forEach(x => { const k = Utilities.formatDate(new Date(x.transaction_date), tz, 'yyyy-MM-dd'); byD[k] = (byD[k] || 0) + +x.grand_total; });
  det.forEach(d => { const o = top[d.product_name] = top[d.product_name] || { name: d.product_name, qty: 0, total: 0 }; o.qty += +d.qty; o.total += +d.total; });
  const net = tx.reduce((a, x) => a + x.subtotal - x.discount, 0), cogs = det.reduce((a, d) => a + d.cost_price * d.qty, 0);
  const ST = all_('Branch_Stock').filter(s => (!al || al.includes(s.branch_id)) && (!p.branch_id || s.branch_id === p.branch_id)), PM = {};
  all_('Products').forEach(x => PM[x.product_id] = x);
  return { count: tx.length, omzet: tx.reduce((a, x) => a + +x.grand_total, 0), net, cogs, gross_profit: net - cogs, byMethod: byM, byDay: byD,
    top: Object.values(top).sort((a, b) => b.total - a.total).slice(0, 10),
    low: ST.filter(s => PM[s.product_id] && !PM[s.product_id].is_service && +s.available_qty <= +PM[s.product_id].min_stock).map(s => ({ product: PM[s.product_id].product_name, branch_id: s.branch_id, qty: +s.available_qty, min: +PM[s.product_id].min_stock })),
    tx: tx.slice(-200).reverse().map(x => ({ transaction_id: x.transaction_id, invoice_number: x.invoice_number, date: x.transaction_date, grand_total: x.grand_total, user_id: x.user_id })) };
}

// ===== Router API dan entry point Web App =====
// ---------- Router ----------
const ACT = {
  me: [null, (u) => ({ user: u, branches: all_('Branches').filter(b => b.status === 'active' && (u.perms.includes('*') || u.allowed === '*' || u.allowed.split(',').includes(b.branch_id))).map(b => ({ branch_id: b.branch_id, branch_name: b.branch_name })) })],
  logout: [null, (u, p, t) => { CacheService.getScriptCache().remove('s_' + t); return {}; }],
  getProducts: [null, getProducts_], saveProduct: ['product.write', saveProduct_],
  adjustStock: ['stock.write', adjustStock_], createTransaction: ['sale.create', createTx_], cancelTransaction: ['void', voidTx_],
  syncOfflineTransactions: ['sale.create', sync_], createPurchase: ['purchase.write', createPurchase_], receivePurchase: ['purchase.write', receivePurchase_],
  getReport: ['report.view', report_], saveUser: ['user.manage', saveUser_],
  getUsers: ['user.manage', listUsers_], getBranches: ['user.manage', listBranches_], changePassword: [null, changePassword_],
  getAuditLogs: ['audit.view', (u, p) => all_('Audit_Logs').slice(-(+p.limit || 100)).reverse().map(x => { delete x._row; return x; })]
};
function api(token, action, p) {
  try {
    p = p || {}; if (action === 'login') return JSON.stringify({ ok: 1, data: login_(p) });
    const raw = CacheService.getScriptCache().get('s_' + token); if (!raw) throw new Error('SESI_HABIS');
    const u = JSON.parse(raw), a = ACT[action]; if (!a) throw new Error('Aksi tidak dikenal');
    if (!can_(u, a[0])) throw new Error('Tidak punya izin: ' + a[0]);
    return JSON.stringify({ ok: 1, data: a[1](u, p, token) });
  } catch (e) { return JSON.stringify({ ok: 0, error: String(e.message || e) }); }
}
function out_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON); }
function doGet() { return out_(JSON.stringify({ ok: 1, data: 'KASIR PRO API aktif' })); }
function doPost(e) {
  let r;
  try { r = JSON.parse(e.postData.contents); } catch (x) { return out_(JSON.stringify({ ok: 0, error: 'Format salah' })); }
  return out_(api(r.token, r.action, r.params));
}`;
