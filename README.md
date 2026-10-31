# KASIR PRO

POS multi-cabang. Frontend statis tanpa proses build, database Google Spreadsheet, backend Google Apps Script (API JSON). Unggah folder ini ke hosting statis (Cloudflare Pages, Netlify, GitHub Pages) atau buka `index.html` langsung.

## Struktur
```
index.html            markup + urutan pemuatan skrip
css/style.css         seluruh gaya (termasuk cetak struk)
js/core/              config (status & URL API), util (helper), store (panggilan API, IndexedDB),
                      auth (izin, login, boot), nav (kerangka & tab menurut izin)
js/views/             satu berkas per halaman: pos, produk, stok, laporan, server
js/features/          print (struk), sync (antrean offline, salin kode), gas-code (salinan backend)
js/main.js            start aplikasi
backend/Code.gs       backend Apps Script (24 sheet, auth, stok, transaksi, pembelian, laporan, sinkron)
tools/sync-gas.py     salin backend/Code.gs ke js/features/gas-code.js
tools/smoke.js        uji asap tanpa browser/Google: node tools/smoke.js
```

## Pasang
1. Spreadsheet kosong > Extensions > Apps Script, tempel isi `backend/Code.gs` (atau tombol "Salin kode Apps Script" di layar Sambungkan / tab Server).
2. Set zona waktu proyek `Asia/Jakarta`. Jalankan `initializeDatabase` sekali; username `admin` dan password awal ada di log eksekusi. Segera ganti.
3. Deploy > Aplikasi web: jalankan sebagai Saya, akses Siapa saja. Salin URL `/exec`.
4. Pemilik mengisi `API_URL` di `js/core/config.js` dengan URL `/exec`, lalu mengunggah aplikasi. Semua perangkat langsung tersambung dan layar login hanya meminta username dan password. Alternatif: biarkan `API_URL` kosong; saat pertama dibuka perangkat menampilkan layar "Sambungkan ke server" untuk diisi pemilik sekali per perangkat.
5. URL dan kode backend bisa diubah/disalin lagi lewat tab **Server** (izin `server.setting`: Super Admin dan Owner). Database yang sudah terlanjur dibuat: tambahkan `server.setting` ke kolom permissions role Owner di sheet Roles.

## Aturan penting
- Skrip klasik (bukan ES module), satu lingkup global. **Urutan `<script>` di `index.html` menentukan segalanya**: `core` dulu, `views`, `features`, `main.js` terakhir.
- Halaman baru: buat `js/views/nama.js` berisi fungsi halaman, tambahkan ke daftar tab di `js/core/nav.js` dan `<script>` di `index.html`.
- Setelah mengubah `backend/Code.gs`: `python3 tools/sync-gas.py`, tempel ulang ke Apps Script, lalu Deploy > Kelola deployment > versi baru. `Code.gs` tidak boleh berisi backtick, `${`, atau backslash.
- Semua izin divalidasi di backend (`ACT` di `Code.gs`). Token sesi hanya di `sessionStorage`, antrean offline dan cache produk di IndexedDB.
- Jalankan `node tools/smoke.js` setelah setiap perubahan.

## Belum ada
Transfer antar cabang, retur, pelanggan/piutang, supplier, pengeluaran, shift kasir, layar admin (pengguna, cabang, audit log), backup terjadwal, Service Worker/PWA, ekspor PDF/Excel, grafik.
