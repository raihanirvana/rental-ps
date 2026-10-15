# Review RPS-001–RPS-003

Tanggal: 15 Oktober 2026. Hasil: **layak dilanjutkan ke RPS-004 setelah perbaikan di bawah**.
Ruang lingkup: fondasi, skema/seed, sesi/peran. Bukan penerimaan fitur katalog atau booking API.

## Temuan dan perbaikan

| Temuan | Dampak | Perbaikan |
| --- | --- | --- |
| GET sesi dan logout dengan token revoked mengirim cookie penghapusan | Respons request lama dapat menghapus cookie pengganti setelah role switch | Keduanya tetap menolak/mengabaikan token lama tanpa Set-Cookie. Logout memutuskan ini dari data sesi di dalam transaksi |
| Revoked diperiksa sebelum expiry | Token role lama yang sudah expired masih mendapat SESSION_CHANGED sehingga tidak bisa langsung memulai demo baru | Expiry diperiksa lebih dahulu; login dengan token expired membuat workspace baru |
| Durasi memakai unixepoch yang mengabaikan pecahan detik akhir | Booking/blok berakhir pada `.500Z` bisa lolos dan merusak batas slot bersebelahan | Migrasi 002 menolak akhir interval di luar grid presisi 30 menit |
| Confirmed bisa menyimpan cancelled_at tanpa aktor pembatalan | Metadata status menjadi tidak konsisten | Guard insert/update pada migrasi 002 menolak timestamp pembatalan untuk status non-cancelled |
| SQLite sibuk/terkunci menjadi INTERNAL_ERROR 500 | Client tidak tahu permintaan dapat diulang | 503 DATABASE_BUSY dengan Retry-After: 1; transaksi tidak mengubah sesi/cookie |

Migrasi `001_initial_schema.sql` tidak diubah. Database v1 berisi seed diuji naik ke v2;
14 booking tetap ada, seed ulang tidak menggandakan data, dan checksum migrasi tetap valid.
Migrasi baru mencegah data invalid berikutnya; tidak mengedit jadwal yang sudah ada.

## Verifikasi yang dijalankan

Semua database uji berada di direktori sementara sistem dan server mendengarkan port
sementara. Tidak memakai file database pengembangan atau menghentikan server proyek lain.
Tidak membuat unit test.

- Instalasi bersih melalui `npm ci` di salinan sementara: 235 paket berhasil dipasang.
- `npm run check`: format, ESLint dan build lolos di repo serta salinan instalasi bersih.
- Probe aturan ESLint melalui lintText: fungsi 25 baris diterima, 26 baris ditolak,
  termasuk blank line. Tidak mematikan aturan untuk prototype desain.
- Migrasi fresh v1/v2, pengulangan migrasi dan seed, serta upgrade v1 berisi data ke v2.
- Seed relatif WIB dekat pergantian hari: 4 unit, 14 booking, 2 blok; completed tidak di masa depan.
- Health 200, API tidak dikenal JSON 404, session tanpa cookie 401, deep link produksi 200 HTML.
- Dua cookie jar mendapat workspace berbeda; token database berupa hash 64 karakter.
- Body dengan field asing, peran admin/__proto__, array/null dan JSON rusak ditolak.
- Header role/workspace palsu tidak mengubah hak akses.
- Ganti peran mempertahankan workspace/TTL. GET dan logout token lama tidak mengirim Set-Cookie.
- Enam ganti peran bersamaan: satu 200 dan lima 409 SESSION_CHANGED tanpa Set-Cookie.
- Lima login pengunjung berbeda bersamaan menghasilkan lima workspace berbeda.
- Middleware asli requireRole diuji di harness sementara: customer/pemalsuan 403,
  tanpa sesi 401, owner 200. Belum ada endpoint bisnis owner pada tahap ini.
- FK lintas workspace, overlap sebagian, adjacency, blok dan snapshot harga diuji lewat SQL.
- Akhir `.500Z` pada booking/blok dan timestamp pembatalan parsial ditolak.
- Seed sengaja digagalkan pada insert blok: tidak ada workspace/sesi setengah jadi.
  Error 500 pada skenario ini memang diharapkan untuk kegagalan internal yang diinjeksi.
- Koneksi penulis lain memegang lock: login mendapat 503 DATABASE_BUSY/Retry-After,
  sesi sebelumnya tetap berlaku dan cookie tidak berubah.
- withWorkspaceAccess menolak sesi yang dicabut setelah pembacaan awal.
- X-Forwarded-Proto palsu tidak memberi Secure; proxy loopback terpercaya memberi Secure.
- Token revoked yang expired mendapat SESSION_EXPIRED; login kembali berhasil membuat
  workspace baru. Cleanup tidak menghapus workspace aktif pengunjung kedua.
- Restart server/database mempertahankan sesi aktif. Logout cascade dan pengulangan aman;
  workspace pengunjung lain tetap utuh. integrity_check ok dan foreign_key_check kosong.
- Chromium headless: shell produksi dan shell melalui Vite menampilkan API terhubung;
  cookie jar browser mempertahankan token pengganti setelah GET/logout dengan token lama.
  Tidak ada pageerror selama pemeriksaan tersebut.

Harness review disimpan sementara di luar repo; yang diuji adalah HTTP, SQLite, middleware
asli dan browser. Hasil skrip integrasi: 17 kelompok pemeriksaan lulus. Tidak ada dependency
pengujian atau unit test baru yang ditambahkan.

## Batas yang tetap berlaku

- Belum ada API booking/availability atau UI pelanggan/pemilik; itu RPS-004 dan berikutnya.
- Origin check, rate limit dan kapasitas demo tetap RPS-012; bukan klaim siap produksi.
- requireRole menggunakan harness, perlu diuji ulang pada endpoint owner sebenarnya.
- HTTPS diuji lewat proxy loopback terkontrol, belum deployment HTTPS publik.
- Browser review hanya Chromium headless; Firefox/Safari belum diuji.
- Prototype `docs/design` disertakan sebagai referensi desain sebelumnya; RPS-006 tetap
  Belum dimulai. Build produksi masih shell React fondasi.
