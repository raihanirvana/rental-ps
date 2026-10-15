# Verifikasi Sesi Play

Proyek ini **tidak memakai unit test** (preferensi pemilik). Verifikasi terdiri dari pemeriksaan
statis, skrip integrasi API yang bisa diulang, dan pemeriksaan browser. Dokumen ini mencatat hasil
nyata terakhir sesudah review RPS-012, 15 Oktober 2026, macOS, Node 22.20.0.

## Cara menjalankan

```bash
npm run check        # Prettier, ESLint (fungsi ≤25 baris, baris ≤100 karakter), build Vite
npm run verify:api   # integrasi API: server proyek asli, SQLite & port sementara
```

`verify:api` (`scripts/verify-api.js`, `scripts/verify/*`):

- Menyalakan server proyek sebagai child process di port acak dengan database di direktori
  sementara sistem, termasuk **dua proses pada file SQLite sama** untuk race, satu server
  `TRUST_PROXY=loopback` dan satu server dengan batas kecil (sesi 6/10 menit, API 25/menit,
  2 workspace). Database pengembangan tidak disentuh; hanya proses milik skrip yang dihentikan.
- Tanggal diambil dari `serverDate` server (tanpa tanggal hardcoded). Keadaan yang tidak bisa
  dibuat lewat API (booking sedang berlangsung, workspace kedaluwarsa, booking berakhir untuk
  race status) dibuat sebagai fixture langsung di database sementara dengan foreign key aktif.
- Lead time/slot lewat hari ini bergantung jam uji: bila tidak ada kandidat dalam jam buka,
  skrip mencatat `CATAT … tidak bisa diuji` alih-alih menandai lulus. Larangan batal setelah
  mulai memakai fixture confirmed kemarin yang sudah berakhir, sehingga tetap diuji malam hari.
- Konfigurasi child process diisolasi dari `.env`/environment lokal (batas, proxy, origin dan TTL);
  hanya override eksplisit skenario yang dipakai. Kegagalan startup tetap membersihkan proses.
- Keluar dengan kode 1 bila ada pemeriksaan gagal.

## Hasil `npm run verify:api` terakhir: 72/72 lulus

| Kelompok | Pemeriksaan |
| --- | --- |
| PRD §13 booking | PS5 A D+1 19.00 120 menit → Rp50.000, selesai 21.00, nomor `SP-…`; 20.30 ditolak; 21.00 bersebelahan dan PS5 B diterima; dua request bersamaan → 201+409; 22.30, kemarin, D+15, 31 Feb, 19.15 ditolak; 22.30 tidak ditawarkan; field palsu (total, tarif, status, workspaceId, role) 400; retry key sama → booking sama 200; key sama jam beda 409 |
| PRD §13 lanjutan | Slot lewat/<15 menit hari ini ditolak (diuji 21.30 WIB); slot diblokir tidak tersedia dan POST langsung 409; blok menabrak booking 409; batal sebelum mulai → slot bebas; batal setelah mulai 409 dan status tetap; snapshot tetap setelah nama/tarif unit berubah; nonaktif dengan booking mendatang 409 |
| Keamanan | Origin asing 403; DELETE lintas situs tanpa Origin 403; body non-JSON 415; body >100 KB 413; tanpa `Access-Control-Allow-Origin`; CSP/anti-iframe/nosniff; API no-store; tanpa HSTS di HTTP; error JSON tanpa stack trace dengan requestId; payload SQL dan markup disimpan sebagai teks; `%` ditolak validasi; customer + role palsu → 403; tanpa sesi 401; katalog anonim tanpa cookie/workspace |
| Race 2 proses | Booking vs booking 6/6 ronde 201+409; booking vs blok 6/6 tepat satu sukses; cancel vs complete 6/6 tepat satu transisi; integrity ok, FK 0 |
| Restart / data hilang | Cookie lama tetap berlaku dan booking ada setelah server restart; cookie lama ke server dengan database baru → 401 tanpa data |
| Isolasi | Pengunjung kedua tidak melihat slot/booking/detail pengunjung pertama (404); reset pengunjung pertama tidak mengubah pengunjung kedua; reset bersamaan booking konsisten; sesi habis → 401 `SESSION_EXPIRED` |
| Proxy | `TRUST_PROXY=loopback` + HTTPS diteruskan → cookie Secure + HSTS; `TRUST_PROXY=false` + `X-Forwarded-Proto` palsu → origin HTTPS ditolak, cookie tanpa Secure |
| Batas | Kapasitas 2 workspace → login ketiga 503 `DEMO_CAPACITY` + Retry-After; ganti peran tetap 200 saat penuh; batas sesi → 429 + Retry-After; batas API → 429 + Retry-After 60 |
| Log | Log server tanpa nama pelanggan, payload uji, token/cookie atau stack trace |

Tambahan sesudah review:

- Charset/kompresi unsupported → 415; gzip rusak dan URL encoding rusak → 400; body gzip
  yang menjadi >100 KB setelah didekompresi → 413. Input privat tidak dipantulkan atau dicatat.
- Origin null/path/fragment/kredensial dan same-site tanpa Origin ditolak; allowlist dinormalisasi
  tanpa mengaktifkan CORS.
- Dua proses berebut satu slot kapasitas: 201+503, total workspace tetap dua. Workspace expired
  dibersihkan agar kapasitas dapat dipakai lagi.
- Proxy tepercaya membedakan batas per IP; X-Forwarded-For palsu pada server tanpa trust proxy
  tidak melewati rate limit. Header Retry-After diperiksa nilainya.
- Seed reset sengaja digagalkan di tengah transaksi: seluruh snapshot pulih. Respons 500 serta
  log tidak memuat pesan trigger/input privat; log sebelum restart ikut diperiksa.

Suite 72 pemeriksaan juga lulus ketika environment induk sengaja diisi batas 1, TTL 1,
trust proxy dan origin asing; override child process mencegah konfigurasi itu mencemari uji.
Pemeriksaan tambahan membuktikan startup gagal pulih dan `stop()` aman diulang.

## Browser

Hanya **Chromium 153 headless** melalui Playwright yang sudah terpasang di lingkungan pengembang
(bukan dependency proyek). Harness browser berada di direktori sementara dan tidak disimpan di repo.
Firefox, Safari, perangkat fisik dan pembaca layar sungguhan **belum diuji**.

| Pemeriksaan (build produksi, header keamanan aktif) | Hasil |
| --- | --- |
| Penelusuran semua halaman dengan pendengar `securitypolicyviolation` | 0 pelanggaran CSP; 4 font lokal termuat; posisi timeline via CSSOM berfungsi; satu-satunya error console = 401 cek sesi anonim (diharapkan) |
| Suite RPS-006: landing anonim, CTA, refresh/tab baru, ganti peran, layar peran salah, request langsung 401, dialog logout (Escape/konfirmasi), sesi habis, error 503/jaringan + coba lagi, urutan Tab dari skip link, reduced motion (transisi 0s), 360/768/1280 tanpa overflow | Lulus |
| Suite RPS-007: alur booking D+1, klik ganda, koneksi putus/timeout 15 dtk + retry key sama, ganti tanggal cepat, empty/error state, slot direbut (409) dengan isian tetap, validasi dan error field server, ganti peran saat menyimpan, keyboard, 360/768 | Lulus |
| Suite RPS-008: booking saya kosong/paging/respons lambat, detail snapshot, dialog batal, 409, booking berlangsung, URL seed/asing/rusak, 503/jaringan, keyboard, 360/768 | Lulus |
| Suite RPS-009: agenda, sedang main, filter + refresh, respons filter lama diabaikan, batal/tandai selesai dari dialog, blok, hari kosong, 503, unit asing, keyboard, 360/768, customer ditolak | Lulus |
| Suite RPS-010: unit/blok (validasi, duplikat, ubah, nonaktif ditolak/berhasil, blok konflik, hapus), 503, keyboard, 360/768/1280, pengunjung kedua, customer | Lulus |
| Suite RPS-011: pengaturan (validasi, markup sebagai teks), dialog reset batal/503, reset, tab lain memuat ulang (focus/header versi), respons sebelum reset, 360/768/1280 | Lulus |
| Mode dev (Vite proxy, Host asli) | POST dari origin dev 201, origin asing 403; penelusuran alur utama tanpa page error; satu 401 anonim |

Suite RPS-006/007/009 lama disesuaikan saat uji 22.00 WIB: langkah yang memerlukan slot sore hari
dipindah ke D+1, dan ekspektasi halaman placeholder RPS-006 diganti dengan halaman yang kini ada.
Bukti implementasi awal memakai batas rate longgar. Saat review, tiga suite RPS-006–011
(10 + 10 + 13 kelompok) diulang dengan `DEMO_SESSION_LIMIT=30`, `API_RATE_LIMIT=300` dan
header keamanan aktif: semua lulus, tanpa page error atau pelanggaran CSP tak disengaja.
Proxy streaming pada harness timeout mempertahankan Host/Origin asli; memakai HTTP native
agar Host tidak diganti oleh klien fetch. Mode dev juga diuji ulang sampai reset.

Alur browser tambahan dari landing anonim → booking → detail → owner/agenda → unit →
pengaturan/reset memakai batas default: empat font lokal termuat, timeline CSSOM benar,
markup tetap teks dan layout 360/768/1280px tanpa overflow. Console jalur normal hanya 401
cek sesi anonim. Form dari origin loopback lain benar-benar mendapat 403 tanpa mengubah
workspace; probe script inline diblokir CSP (pelanggaran yang sengaja dipicu, terpisah dari
jalur normal). Rincian di [catatan review](REVIEW-RPS-012.md).

## Console yang dijelaskan

- `401 Unauthorized` pada `GET /api/session` di halaman tanpa sesi: cara client mengetahui belum
  masuk demo (kontrak RPS-003).
- `503`/`net::ERR_FAILED` hanya muncul pada skenario error yang sengaja diinjeksi.

## Belum diuji / batas yang diketahui

- Browser selain Chromium, perangkat fisik, pembaca layar sungguhan.
- HTTPS publik dan deployment (RPS-013); HTTPS hanya disimulasikan dengan header proxy dari loopback.
- Lebih dari satu instance di belakang load balancer: rate limit per proses, SQLite satu file.
- Dua proses yang dinyalakan bersamaan pada database baru bisa gagal mengaktifkan WAL; desainnya
  satu instance penulis.
- Tab lain tidak di-polling: data lama tampil sampai tab aktif kembali atau request berikutnya.
- Paginasi limit/offset dapat bergeser bila data berubah antarhalaman.
- Tidak ada printer/struk; aplikasi tidak memproses pembayaran.
