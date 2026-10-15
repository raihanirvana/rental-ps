# Sesi Play — demo booking rental PlayStation

Proyek portfolio dan contoh jasa pembuatan website untuk bisnis rental PS.
**RPS-001–RPS-013 selesai.** Demo publik: **https://sesi-play.onrender.com**.
Frontend dan API sudah diverifikasi pada satu service Render Free.
Pembukaan pertama setelah idle bisa memerlukan sekitar satu menit; data demo sementara.

Model yang sudah dipilih pemilik: pelanggan **main di tempat**, booking unit PS/bilik
per jam. Model dibawa pulang/sewa harian berada di luar cakupan MVP.

## Mulai membaca

- [PRD](PRD.md): tujuan, alur pelanggan/pemilik, batas MVP, dan kriteria penerimaan.
- [Acuan desain](DESIGN.md): tiga prototype visual dan panduan implementasi untuk Claude.
- [Backlog](docs/tickets/README.md): 13 tiket berurutan dengan dependensi dan verifikasi.
- [Aturan proyek](AGENTS.md): satu tiket per tahap, fungsi maksimal 25 baris, tanpa unit test.
- [Kontrak API](docs/API.md), [Database](docs/DATABASE.md) dan
  [Verifikasi & hasil nyata](docs/VERIFICATION.md).
- [Deployment dan panduan presentasi](docs/DEPLOYMENT.md): konfigurasi Render Free,
  script deploy, batas kuota dan cara memulai ulang demo setelah data hilang.

## Arah demo

Pelanggan dapat melihat layanan, memilih PS4/PS5 dan jam yang tersedia, membuat booking,
serta melihat/membatalkan bookingnya. Pemilik dapat melihat agenda, mengatur unit dan
memblokir jadwal. Tiap pengunjung memakai ruang demo sendiri; data percobaan tidak
memengaruhi pengunjung lain. Pembayaran dilakukan di lokasi dan tidak diproses aplikasi.

Nama **Sesi Play** dan seluruh tarif merupakan identitas/data contoh, bukan bisnis nyata.
Tidak ada integrasi pembayaran, WhatsApp otomatis, SMS, atau email pengiriman.

## Stack

React 19 + Vite 7, CSS biasa, Express 5, SQLite (`node:sqlite`, mulai RPS-002), JavaScript ESM.
Satu server Node menyajikan build React dan `/api`. Versi dipin persis di `package.json`
(`save-exact`) dan `package-lock.json`, mengikuti kombinasi yang sudah berjalan di proyek POS.

| Kebutuhan | Versi |
| --- | --- |
| Node.js | 22.20.0 (`.nvmrc`); minimum 22.13.0 karena `node:sqlite` tanpa flag |
| npm | 10.x |
| Registry | Default npm lokal; baris `registry=https://registry.npmjs.org/` di `.npmrc` dikomentari. Aktifkan bila mirror belum punya versi yang dipin |

`node:sqlite` di Node 22 masih berlabel eksperimental dan mencetak `ExperimentalWarning`;
itu wajar. `.npmrc` memakai `engine-strict=true` sehingga install di Node lebih lama ditolak.

## Menjalankan lokal

```bash
nvm use                 # Node 22.20.0; didukung 22.13.0 sampai sebelum 23
cp .env.example .env    # opsional; nilai default sama
npm ci                  # instalasi bersih sesuai package-lock.json
npm run dev             # Vite http://127.0.0.1:5173 + API http://127.0.0.1:3001
```

Saat dev, Vite meneruskan `/api` ke Express dengan `changeOrigin: false` sehingga header
`Host` asli (`127.0.0.1:5173`) tetap terlihat oleh server untuk pemeriksaan origin kelak.

Produksi lokal (satu server untuk UI dan API):

```bash
npm run build
npm start               # http://127.0.0.1:3001
```

| Script | Fungsi |
| --- | --- |
| `npm run dev` | UI (Vite) dan API (`node --watch`) bersamaan |
| `npm run build` | Build frontend ke `client/dist` |
| `npm start` | Migrasi otomatis, lalu Express menyajikan `/api` dan build (fallback `index.html`) |
| `npm run db:migrate` | Terapkan migrasi berversi yang belum tercatat (aman diulang) |
| `npm run db:seed` | Buat workspace lokal `contoh-lokal` berisi data contoh (dilewati bila sudah ada) |
| `npm run lint` | ESLint, termasuk batas 25 baris per fungsi dan 100 karakter per baris |
| `npm run format` / `format:check` | Prettier tulis / periksa |
| `npm run check` | Format check, lint dan build. Proyek ini tidak memakai unit test. |
| `npm run verify:api` | Integrasi API (PRD §13, keamanan, race 2 proses, batas) pada server, SQLite dan port sementara |

Variabel environment (`.env.example`):

| Variabel | Default | Fungsi |
| --- | --- | --- |
| `HOST`, `PORT` | `127.0.0.1`, `3001` | Alamat Express (API + build) |
| `WEB_PORT` | `5173` | Port Vite saat dev |
| `DATABASE_PATH` | `./data/sesi-play.sqlite` | File SQLite (arahkan ke file sementara untuk uji) |
| `DEMO_TTL_MINUTES` | `720` | Umur workspace/sesi demo |
| `TRUST_PROXY` | `false` | Isi jumlah hop/alamat hanya di belakang proxy HTTPS; `true` ditolak |
| `ALLOWED_ORIGINS` | kosong | Origin tambahan untuk mutasi (pisahkan koma) |
| `DEMO_SESSION_LIMIT` | `30` | Pembuatan/ganti sesi per IP per 10 menit |
| `API_RATE_LIMIT` | `300` | Request API per IP per menit |
| `DEMO_MAX_WORKSPACES` | `200` | Workspace aktif maksimal (dari database; ganti peran tetap bisa) |

## Keamanan demo

- Cookie sesi HttpOnly, SameSite=Strict, Path=/api, Secure di HTTPS lewat proxy tepercaya;
  token hanya disimpan sebagai hash. Workspace/peran/harga/status selalu dari server.
- Origin mutasi harus origin aplikasi (atau `ALLOWED_ORIGINS`); browser lintas situs tanpa
  Origin ditolak. Klien non-browser tanpa Origin/Fetch Metadata tetap bisa dipakai.
  Body nonkosong wajib JSON ≤100 KB setelah dekompresi; tanpa CORS.
- Header: CSP aset lokal (tanpa `unsafe-inline`), `frame-ancestors 'none'`/`X-Frame-Options: DENY`,
  `nosniff`, `Referrer-Policy`, HSTS hanya pada HTTPS. Respons API `no-store`.
- Error JSON tanpa stack trace; log error API hanya kode + requestId, tanpa isi request,
  pesan database mentah, nama/nomor/token.
- Ini simulasi peran untuk demo, **bukan login produksi**.

## Database

SQLite melalui `node:sqlite` (WAL, `foreign_keys=ON`, `busy_timeout` 5 detik). Migrasi
di `server/database/migrations/NNN_nama.sql`, dicatat dengan checksum di `schema_migrations`.
Migrasi yang sudah diterapkan tidak boleh diubah; tambahkan file baru.

- Tabel: `workspaces`, `sessions`, `business_settings`, `units`, `bookings`,
  `booking_requests`, `unit_blocks`. Waktu ISO UTC, rupiah integer, tabel `STRICT`.
- FK komposit `(workspace_id, id)` mencegah booking/blok/request menunjuk data workspace lain.
- CHECK menjaga enum, jam buka WIB 10.00–23.00, kelipatan 30 menit, durasi 60/120/180,
  total = tarif × durasi, serta konsistensi status cancelled/completed.
- Trigger cadangan: bentrok `[mulai, selesai)` booking/blok, jadwal booking tidak bisa diubah,
  status terminal, maksimal 20 unit. Migrasi 002 menutup celah pecahan detik pada akhir
  interval dan timestamp pembatalan parsial. Service tetap wajib memeriksa di transaksi (RPS-004/005).
- Seed per workspace (`server/database/seed/`) relatif terhadap tanggal WIB saat dibuat,
  dibungkus satu transaksi `BEGIN IMMEDIATE`.

## API saat ini

- `GET /api/health` → 200 `{ "status": "ok", "database": "connected", … }`; 503
  `{ "status": "degraded", "database": "unavailable" }` bila database tidak bisa dibaca.
- `POST /api/demo/sessions` body `{ "role": "customer" | "owner" }` → 201 workspace baru
  (seed 4 unit, 14 booking, 2 blok) atau 200 ganti peran di workspace yang sama. Field lain
  ditolak 400. Token yang sudah dicabut dan belum expired → 409 `SESSION_CHANGED`.
  Token expired dapat memulai workspace baru.
- `GET /api/session` → peran dan masa berlaku; 401 `UNAUTHENTICATED`/`SESSION_EXPIRED`.
  Cookie invalid/expired dibersihkan; respons token revoked tidak menghapus cookie baru.
- `DELETE /api/session` → 204, menghapus workspace milik token yang masih aktif; aman diulang.
  Request dengan token revoked tidak menghapus workspace/cookie penggantinya.
- Cookie `sesi_play_session`: HttpOnly, SameSite=Strict, Path=/api, Secure di HTTPS.
  Workspace dan peran hanya dari sesi server. Seluruh `/api` memakai `Cache-Control: no-store`.
- Database sibuk/terkunci → 503 `DATABASE_BUSY` dengan `Retry-After: 1`, bukan 500.
- `GET /api/catalog` → tanpa sesi: contoh publik statis (`source: "sample"`, `id: null`,
  tanpa cookie/workspace); dengan sesi: unit dan identitas workspace sendiri. Memuat `rules`,
  `serverDate` dan `bookableDates` (D…D+14 WIB dari server).
- `GET /api/availability?unitId=&date=YYYY-MM-DD&durationMinutes=60|120|180` (perlu sesi)
  → slot 30 menit WIB dengan `available`/`reason` (`past`, `lead_time`, `blocked`, `booked`,
  `unit_inactive`), `quote` (termasuk `id` snapshot tarif/unit), `serverTime`, `bookableDates` (D…D+14). Slot tidak ditahan.
- `POST /api/bookings` body `{ unitId, date, startTime, durationMinutes, customerName,
  phone?, idempotencyKey, quoteId? }` → 201 baru / 200 replay; harga, status dan workspace dari server.
  Frontend selalu menyertakan quoteId dari availability; mismatch → 409 `QUOTE_CHANGED`
  tanpa booking, lalu pengguna meninjau harga terbaru. API lama tanpa quoteId tetap didukung.
  409 `SLOT_UNAVAILABLE`, `IDEMPOTENCY_CONFLICT`, `UNIT_INACTIVE`; 400 dengan `fields`.
- `GET /api/bookings/mine?view=upcoming|finished|cancelled&limit=&offset=` → booking
  pengunjung workspace sendiri (seed tidak termasuk).
- `GET /api/bookings/:id` → detail sesuai hak akses (customer: booking pengunjung; owner: semua).
- `POST /api/bookings/:id/cancel` body `{ reason? }` → customer sebelum mulai, owner confirmed.
  Boleh tanpa body; jika mengirim body wajib JSON. Non-JSON/karakter kontrol ditolak 400.
- Katalog workspace, availability, mine dan detail mengecek ulang sesi dalam snapshot baca;
  auth yang dicabut/logout tidak dipakai untuk membaca data workspace.
- `GET /api/owner/agenda?date=&unitId=&status=` (owner) → unit, booking tanggal itu (seed
  bertanda `isSample`), blok dan ringkasan. Ringkasan mengikuti filter dan tidak menghitung
  cancelled; sedang main = confirmed dengan mulai ≤ waktu server < selesai; nilai reservasi
  bukan pendapatan diterima.
- `PATCH /api/owner/bookings/:id/status` body `{ "status": "completed" }` (owner) → hanya
  confirmed yang sudah berakhir; terminal tidak berubah (409).
- `GET/POST /api/owner/units`, `PATCH /api/owner/units/:id` (owner) → unit tanpa hapus fisik;
  nonaktif ditolak 409 bila masih ada booking yang belum berakhir; maksimal 20 unit.
- `GET/POST /api/owner/blocks`, `DELETE /api/owner/blocks/:id` (owner) → blok grid 30 menit
  dalam jam buka/horizon; bentrok booking/blok 409.
- `GET /api/settings` (sesi) / `PATCH /api/settings` (owner) → nama, alamat, teks kontak usaha
  contoh; aturan jadwal tetap.
- `POST /api/demo/reset` body `{ "confirm": true }` (owner) → atomik mengembalikan data contoh,
  menghapus key idempotensi dan menaikkan `dataVersion`; sesi dan masa berlaku tetap.
- Respons bersesi membawa header `X-Data-Version`; tab lain memuat ulang saat versi berubah.
- Error JSON: `{ error: { code, message, fields?, requestId } }`; 503 `DATABASE_BUSY`/`DEMO_CAPACITY`
  dan 429 `RATE_LIMITED` membawa `Retry-After`. Kontrak lengkap: [docs/API.md](docs/API.md).
- Path `/api/*` lain → 404 JSON `{ "error": { "code": "NOT_FOUND", "message", "requestId" } }`,
  tidak pernah HTML SPA.

Target demo: Render Free dengan SQLite sementara, tunduk pada kuota akun.
Data bisa hilang saat sleep/restart/redeploy. `render.yaml` dan
`bash scripts/deploy-render.sh --create` menyiapkan satu Node Web Service Free;
redeploy dengan `bash scripts/deploy-render.sh`. Detail: [deployment](docs/DEPLOYMENT.md).

## Struktur

```text
rental-ps/
  PRD.md, AGENTS.md, DESIGN.md, README.md
  client/             Vite root: index.html, vite.config.js, public/fonts (lokal, OFL), src/
                      src: pages/, components/ (landing/), hooks/, lib/ (api, router),
                      session/, styles/ (base, controls, landing, app)
  server/             Express: app.js, index.js, config.js, routes/, middleware/, lib/,
                      database/ (koneksi, transaksi, migrasi, seed), repositories/
  scripts/            migrate.js, seed.js, verify-api.js + verify/ (integrasi API)
  docs/design/        prototype visual statis (acuan, bukan aplikasi)
  docs/               API.md, DATABASE.md, VERIFICATION.md, REVIEW-*.md
  docs/tickets/       backlog dan rincian RPS-001–RPS-013
```

Repo Git: `https://github.com/raihanirvana/rental-ps.git`. `.gitignore` mengecualikan `.env`,
`node_modules/`, `client/dist/`, `data/` dan file SQLite.

Hasil review: [RPS-001–003](docs/REVIEW-RPS-001-003.md),
[RPS-004–005](docs/REVIEW-RPS-004-005.md), [RPS-006–007](docs/REVIEW-RPS-006-007.md)
[RPS-008–009](docs/REVIEW-RPS-008-009.md), [RPS-010–011](docs/REVIEW-RPS-010-011.md)
dan [RPS-012](docs/REVIEW-RPS-012.md).

## Mencoba demo publik

Buka **https://sesi-play.onrender.com** → **Coba booking**, pilih unit dan tanggal besok,
lalu konfirmasi memakai data contoh. **Coba sebagai pemilik** membuka agenda dengan data
yang sama. Mode incognito mendapat ruang terpisah. Tidak ada pembayaran sungguhan.

Service Free tidur setelah 15 menit tanpa traffic. SQLite dapat hilang saat sleep, restart
atau redeploy; mulai demo lagi jika sesi sudah tidak berlaku. Kuota 750 jam instance/bulan
dibagi seluruh Free Web Service di workspace, termasuk POS. Bandwidth/build juga berkuota;
akun dengan metode pembayaran bisa dikenai biaya kelebihan pemakaian. Detail dan sumber:
[panduan deployment](docs/DEPLOYMENT.md).

Redeploy setelah push: `bash scripts/deploy-render.sh`. Auto-deploy sengaja off.
Panduan presentasi dan pemulihan tersedia di dokumen yang sama; bukti pengujian nyata ada
di [RPS-013](docs/tickets/RPS-013.md). Semua tiket MVP sudah selesai.
