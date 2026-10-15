# Review RPS-012

Tanggal: 15 Oktober 2026. Hasil: **lolos review setelah perbaikan**.
Lingkup: keamanan API/frontend, batas demo, integrasi dan dokumentasi.
Deployment publik tetap RPS-013.

## Temuan dan perbaikan

| Temuan | Reproduksi / dampak | Perbaikan |
| --- | --- | --- |
| Request rusak dianggap error server | Charset/kompresi tidak didukung dan parameter URL dengan encoding rusak mendapat 500 | Pemetaan 415 UNSUPPORTED_CHARSET/UNSUPPORTED_ENCODING, 400 INVALID_URL/INVALID_BODY; JSON rusak/terlalu besar tetap 400/413 |
| Pesan error mentah bisa masuk log | Marker privat pada charset, encoding dan path ikut tercetak dalam error.message | Log error API hanya requestId dan kode error yang ditentukan aplikasi; pesan database/input mentah tidak dicatat |
| Pemeriksaan log kehilangan server sebelum restart | Harness mengganti objek server A saat persistence, sehingga log pertama tidak ikut checkLogs | Simpan log proses pertama; trigger kegagalan reset membuktikan 500 dan log tidak membocorkan marker privat |
| Startup harness bisa meninggalkan proses/data | Server pertama/dua dibuat sebelum try/finally; startServer tidak membersihkan child ketika health gagal | Startup di dalam try, stop child pada kegagalan, cleanup semua server yang berhasil dibuat, stop idempotent dengan batas waktu |
| Health probe bisa mengenai port yang direbut proses lain | Port dicari lalu dilepas sebelum child listen | Tunggu bukti child sendiri sudah listen sebelum health probe; kegagalan startup ditangani |
| Konfigurasi lokal mencemari verifikasi | Environment/.env bisa mengubah proxy/origin/TTL/batas skenario | Child memakai default konfigurasi terkontrol, dengan override eksplisit per skenario; diuji dengan environment induk yang sengaja berbeda |
| Fixture expiry tidak relatif dan identitasnya ambigu | Tanggal Januari 2026 hardcoded; workspace dicari lewat expiry yang tidak unik | Tanggal relatif terhadap startedAt server; workspace dicari melalui ID unit sendiri |
| Fixture batal setelah mulai bisa dilewati karena jam/konflik | Insert ongoing yang menabrak seed atau keluar jam buka hanya dicatat CATAT | Fixture confirmed kemarin pada interval PS4 A yang kosong; kegagalan fixture menjadi kegagalan suite, bukan skip |

Error handler juga meneruskan error bila header sudah terkirim, agar tidak mencoba
mengirim JSON kedua. Tidak menambah dependency atau unit test. Seluruh fungsi tetap
maksimal 25 baris termasuk komentar/blank line/JSX, dengan batas baris 100 karakter.

## Verifikasi API yang dijalankan

`npm run verify:api` awal 60/60 lulus. Sesudah perluasan, **72/72 lulus** pada server proyek
asli, port acak dan SQLite sementara. Suite juga lulus 72/72 ketika environment induk
diisi TRUST_PROXY=loopback, origin asing, TTL 1 dan batas sesi/API/workspace masing-masing 1;
default child tetap terisolasi. Database pengembangan tidak disentuh.

Suite mencakup:

- PRD §13: tarif/total/waktu server, konflik interval, unit lain dan slot bersebelahan,
  grid/jam/horizon/lead time, field palsu, replay key, pembatalan, snapshot dan nonaktif.
- Dua pengunjung, isolasi detail/slot, reset, expiry, restart server dan database hosting hilang.
- Origin asing/null/path/fragment/kredensial, same-site/cross-site tanpa Origin, JSON-only,
  body besar, error/encoding rusak, no-store, header keamanan dan tidak ada CORS wildcard.
- Gzip rusak ditolak 400; body kecil terkompresi yang menjadi >100 KB ditolak 413.
- SQL/markup diperlakukan sebagai data; role palsu ditolak dan katalog anonim tidak membuat workspace.
- Race antarproses: enam booking/booking, enam booking/blok, enam cancel/complete; integritas
  SQLite ok dan foreign key kosong.
- Seed reset sengaja gagal di tengah transaksi: seluruh snapshot workspace, sesi, unit,
  pengaturan, booking, blok dan key identik dengan sebelum reset; respons/log aman.
- Kapasitas dua workspace: login berlebih 503 + Retry-After; ganti peran tetap bisa;
  dua proses berebut slot terakhir hanya menghasilkan satu 201 dan satu 503, total tetap dua.
  Workspace expired dibersihkan agar slot kapasitas bisa dipakai lagi.
- Allowlist origin dinormalisasi, origin lain tetap 403 tanpa CORS.
- Proxy tepercaya menghasilkan cookie Secure/HSTS dan membedakan batas per IP; header proxy
  palsu pada server tanpa trust tidak memberi Secure atau melewati rate limit.
- Batas sesi/API dan nilai Retry-After; log sebelum/sesudah restart tanpa payload privat,
  token/cookie atau stack trace.

Pemeriksaan harness tambahan: startup dengan config invalid ditolak, start berikutnya sehat,
dan stop kedua selesai segera. Direktori sementara dan proses milik uji dibersihkan.

## Browser yang dijalankan

Chromium 153 headless melalui Playwright pada build produksi dengan header keamanan aktif:

- Landing anonim → booking → booking saya/detail → ganti peran → agenda → unit → pengaturan
  dan reset. Jalur normal: **0 pelanggaran CSP, 0 page error**, console hanya 401 cek sesi
  anonim yang memang diharapkan. Empat font lokal termuat; grid-column timeline lewat CSSOM benar.
- Markup settings tetap teks, keyboard/dialog bekerja dan layout 360/768/1280px tanpa overflow.
- Form browser sungguhan dari port/origin lain dengan cookie jar pemilik ditolak 403
  ORIGIN_REJECTED; versi workspace tidak berubah.
- Probe terpisah menyisipkan script inline: CSP benar-benar memblokir eksekusi. Pelanggaran
  yang sengaja dipicu ini dipisahkan dari jalur normal.
- Regresi RPS-006/007: 10 kelompok lulus, termasuk timeout streaming 15 detik, retry key sama,
  quote berubah, konflik slot, sesi/role/expiry, keyboard dan reduced motion.
- Regresi RPS-008/009: 10 kelompok lulus, termasuk paging, snapshot, cancel/complete dan urutan refresh.
- Regresi RPS-010/011: 13 kelompok lulus, termasuk error/retry, teks panjang, reset dan beberapa tab.
- Ketiga suite memakai batas sesi **30** dan API **300**, tanpa dilonggarkan. Tidak ada page
  error atau pelanggaran CSP tak disengaja.
- Vite/StrictMode: skip link, login/ganti peran, agenda/dialog, unit, pengaturan dan reset lulus.
  Proses Vite lain di 5173 tidak dihentikan.

Harness streaming lama awalnya gagal login karena klien fetch pada proxy tidak meneruskan
Host seperti proxy nyata. Diganti HTTP native yang mempertahankan Host/Origin; suite lengkap
kemudian lulus. Pemeriksaan origin server tidak dilonggarkan.

`npm run check` lulus (format, lint, build). Tidak ada secret, database runtime atau unit test
yang ditambahkan ke Git. PRD/README/API/DATABASE/VERIFICATION dan tiket diperbarui.

## Batasan

- Hanya Chromium headless; Firefox, Safari, perangkat fisik dan pembaca layar sungguhan belum diuji.
- HTTPS diuji melalui simulasi proxy loopback; HTTPS/domain publik belum diuji atau dideploy.
- Rate limit per proses di memori; desain tetap satu instance penulis SQLite.
- Kasus lead time/past hari ini dicatat CATAT bila jam pengujian tidak menyediakan kandidat;
  tidak dianggap lulus pada saat itu. Fixture setelah mulai memakai confirmed kemarin,
  bukan memajukan jam perangkat.
- Tab lain revalidasi ketika aktif atau request mendeteksi versi baru; tidak ada polling/push.
- Harness API disimpan di repo; harness browser/screenshot hanya di direktori sementara.
- Tidak ada pembayaran, printer atau deployment pada tiket ini.
