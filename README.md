# Sesi Play — demo booking rental PlayStation

Proyek portfolio dan contoh jasa pembuatan website untuk bisnis rental PS.
Tahap saat ini: **RPS-007 selesai** (pelanggan bisa memilih slot dan membuat booking di UI).
Booking saya, agenda pemilik dan pengelolaan unit belum dibangun di UI.

Model yang sudah dipilih pemilik: pelanggan **main di tempat**, booking unit PS/bilik
per jam. Model dibawa pulang/sewa harian berada di luar cakupan MVP.

## Mulai membaca

- [PRD](PRD.md): tujuan, alur pelanggan/pemilik, batas MVP, dan kriteria penerimaan.
- [Acuan desain](DESIGN.md): tiga prototype visual dan panduan implementasi untuk Claude.
- [Backlog](docs/tickets/README.md): 13 tiket berurutan dengan dependensi dan verifikasi.
- [Aturan proyek](AGENTS.md): satu tiket per tahap, fungsi maksimal 25 baris, tanpa unit test.

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
nvm use                 # atau pastikan `node -v` >= 22.13.0
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

Variabel environment ada di `.env.example`: `HOST`, `PORT`, `WEB_PORT`, `NODE_ENV`,
`DATABASE_PATH` (default `./data/sesi-play.sqlite`), `DEMO_TTL_MINUTES` (default 720),
`TRUST_PROXY` (default `false`; isi jumlah hop/alamat hanya di belakang proxy HTTPS). Untuk uji, arahkan `DATABASE_PATH`
ke file sementara agar database pengembangan tidak tersentuh.

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
- Error JSON: `{ error: { code, message, fields?, requestId } }`; 503 `DATABASE_BUSY` + `Retry-After`.
- Path `/api/*` lain → 404 JSON `{ "error": { "code": "NOT_FOUND", "message", "requestId" } }`,
  tidak pernah HTML SPA.

Target demo awal: Render Free dengan SQLite sementara, tunduk pada kuota akun.
Data bisa hilang saat sleep/restart/redeploy. Belum membuat service hosting atau
mempublikasikan aplikasi. Detail keputusan hosting dikerjakan di RPS-013.

## Struktur

```text
rental-ps/
  PRD.md, AGENTS.md, DESIGN.md, README.md
  client/             Vite root: index.html, vite.config.js, public/fonts (lokal, OFL), src/
                      src: pages/, components/ (landing/), hooks/, lib/ (api, router),
                      session/, styles/ (base, controls, landing, app)
  server/             Express: app.js, index.js, config.js, routes/, middleware/, lib/,
                      database/ (koneksi, transaksi, migrasi, seed), repositories/
  scripts/            migrate.js, seed.js
  docs/design/        prototype visual statis (acuan, bukan aplikasi)
  docs/tickets/       backlog dan rincian RPS-001–RPS-013
```

Repo Git: `https://github.com/raihanirvana/rental-ps.git`. `.gitignore` mengecualikan `.env`,
`node_modules/`, `client/dist/`, `data/` dan file SQLite.

Hasil review: [RPS-001–003](docs/REVIEW-RPS-001-003.md) dan
[RPS-004–005](docs/REVIEW-RPS-004-005.md), serta [RPS-006–007](docs/REVIEW-RPS-006-007.md).

## Tahap berikutnya

**RPS-008** (booking saya, detail dan batal). Kerjakan satu tiket per tahap.
