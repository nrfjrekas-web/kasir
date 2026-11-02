# KASIR PRO

POS multi-cabang. Frontend statis tanpa proses build, database Google Spreadsheet, backend Google Apps Script (API JSON). Unggah folder ini ke hosting statis (Cloudflare Pages, Netlify, GitHub Pages) atau buka `index.html` langsung.

## Struktur
```
index.html            markup + urutan pemuatan skrip
css/style.css         seluruh gaya (termasuk cetak struk)
js/core/              config (URL API), util (helper, pengaturan perangkat), ui (ikon, toast, dialog, keadaan kosong/galat),
                      store (panggilan API, IndexedDB), auth (izin, jenis akun, login, boot), nav (sidebar/tab bar menurut izin)
js/views/             satu berkas per halaman: pos, produk, stok, laporan, setelan (Pengaturan)
js/features/          print (struk), sync (antrean offline)
js/main.js            start aplikasi
backend/Code.gs       backend Apps Script (24 sheet, auth, stok, transaksi, pembelian, laporan, sinkron)
tools/smoke.js        uji asap tanpa browser/Google: node tools/smoke.js
```

## Pasang
1. Pemilik (sekali saja): Spreadsheet kosong > Extensions > Apps Script, tempel isi `backend/Code.gs`, set zona waktu `Asia/Jakarta`, jalankan `initializeDatabase` (username `admin` dan password awal ada di log eksekusi; segera ganti).
2. Deploy > Aplikasi web: jalankan sebagai Saya, akses Siapa saja. Salin URL `/exec`.
3. Isi `API_URL` di `js/core/config.js` dengan URL tersebut, lalu unggah aplikasi.
4. Selesai. Kasir dan admin hanya melihat layar login (username + password dari pemilik). Tidak ada lagi input URL atau kode Apps Script di aplikasi.

## Pengaturan dan jenis akun
Menu **Pengaturan** (semua pengguna): Akun (profil, akses, ganti password), Tampilan (terang/gelap/otomatis), Struk (nama usaha, penutup, lebar 58/80 mm, cetak otomatis), Perangkat (antrean offline, sinkron). Bagian **Pengguna** muncul untuk izin `user.manage`.

Akun kasir dibuat di Pengaturan > Pengguna dengan dua tipe (peran tetap `Kasir`, pembedanya kolom `allowed_branch_ids`):
- **Kasir Cabang**: `branch_id` dan `allowed_branch_ids` = satu cabang. Terkunci, pemilih cabang tidak muncul.
- **Kasir Pusat**: `branch_id` = cabang utama, `allowed_branch_ids` = `*`. Bisa berpindah ke semua cabang.
Admin Pusat tidak dapat membuat atau mengubah akun Super Admin, Owner, atau Admin Pusat; hanya Super Admin yang bisa. Setelah memperbarui `Code.gs`, tempel ulang ke Apps Script dan deploy versi baru agar aksi `getUsers`, `getBranches`, `changePassword` aktif.

## Aturan penting
- Skrip klasik (bukan ES module), satu lingkup global. **Urutan `<script>` di `index.html` menentukan segalanya**: `core` dulu, `views`, `features`, `main.js` terakhir.
- Halaman baru: buat `js/views/nama.js` berisi fungsi halaman, tambahkan ke `TABS` dan peta fungsi di `js/core/nav.js` dan `<script>` di `index.html`. Pakai `toast`, `ask`, `sure`, `empty`, `skel` dari `ui.js`, bukan `alert/prompt/confirm`.
- Setelah mengubah `backend/Code.gs`: tempel ulang ke Apps Script, lalu Deploy > Kelola deployment > versi baru.
- Semua izin divalidasi di backend (`ACT` di `Code.gs`). Token sesi hanya di `sessionStorage`, antrean offline dan cache produk di IndexedDB.
- Jalankan `node tools/smoke.js` setelah setiap perubahan.

## Belum ada
Transfer antar cabang, retur, pelanggan/piutang, supplier, pengeluaran, shift kasir, layar admin (pengguna, cabang, audit log), backup terjadwal, Service Worker/PWA, ekspor PDF/Excel, grafik.
