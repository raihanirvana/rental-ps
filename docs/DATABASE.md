# Database Sesi Play

SQLite melalui `node:sqlite` (Node 22.13+; diuji 22.20.0, SQLite 3.50.4). Satu file
(`DATABASE_PATH`, default `./data/sesi-play.sqlite`, tidak masuk Git), satu instance penulis.
Koneksi: `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000`.

## Migrasi

`server/database/migrations/NNN_nama.sql`, diterapkan otomatis saat server start atau
`npm run db:migrate`, satu transaksi per migrasi dan dicatat dengan checksum di
`schema_migrations`. Migrasi yang sudah diterapkan tidak boleh diubah; tambahkan file baru.

| Versi | Isi |
| --- | --- |
| 001 `initial_schema` | Tabel, constraint, indeks dan trigger utama |
| 002 `interval_precision` | Trigger akhir interval tepat grid 30 menit dan larangan timestamp pembatalan pada status non-cancelled |

## Tabel

Semua tabel `STRICT`. Waktu ISO UTC (`YYYY-MM-DDTHH:MM:SS.sssZ`), rupiah integer.

| Tabel | Isi penting |
| --- | --- |
| `workspaces` | `id`, `data_version` (naik saat reset), `created_at`, `expires_at`, `seeded_at` |
| `sessions` | `token_hash` (SHA-256, unik), `role` customer/owner, `expires_at`, `revoked_at` |
| `business_settings` | Satu baris per workspace: nama, alamat, teks kontak |
| `units` | Nama (unik NOCASE per workspace, 2–40), `kind` PS4/PS5, `hourly_rate` 1.000–1.000.000, `is_active`, `seed_key` |
| `bookings` | `reference` unik per workspace, `source` visitor/seed, interval, durasi 60/120/180, snapshot `unit_name`/`unit_kind`/`hourly_rate`/`total_price`, pelanggan, `status`, data pembatalan/penyelesaian |
| `booking_requests` | PK (`workspace_id`, `idempotency_key`), `request_hash`, `booking_id` |
| `unit_blocks` | Interval blok per unit, `source` owner/seed, catatan ≤120 |

## Integritas

- **Lintas workspace:** FK komposit `(workspace_id, unit_id) → units(workspace_id, id)` untuk
  booking dan blok, `(workspace_id, booking_id) → bookings(workspace_id, id)` untuk key. Menghapus
  workspace meng-cascade seluruh datanya.
- **CHECK booking/blok:** mulai pada :00/:30, dalam 10.00–23.00 WIB pada satu hari, durasi sesuai,
  `total_price * 60 = hourly_rate * duration_minutes`, status cancelled ⇔ `cancelled_at` + aktor,
  completed ⇔ `completed_at ≥ ends_at`, nomor HP 8–15 digit opsional `+`.
- **Trigger pengaman terakhir** (service tetap memeriksa di transaksi dan mengembalikan 409 jelas):
  bentrok `[mulai, selesai)` booking non-cancelled/blok (`SCHEDULE_CONFLICT`), jadwal & snapshot
  booking tidak bisa diubah, status cancelled/completed terminal, maksimal 20 unit, akhir interval
  tepat grid, tidak ada timestamp pembatalan parsial.

## Transaksi

- Mutasi (`withWorkspaceAccess`): `BEGIN IMMEDIATE` → sesi/peran/expiry diperiksa ulang dari tabel
  `sessions` → pemeriksaan keadaan → tulis. Error apa pun → ROLLBACK.
- Baca workspace (`withWorkspaceReadAccess`): `BEGIN` deferred, sesi diperiksa dalam snapshot sama.
- Login baru: hapus workspace kedaluwarsa → cek kapasitas → workspace + seed + sesi dalam satu transaksi.
- Reset: hapus key → booking → blok → unit → pengaturan, naikkan `data_version`, seed ulang
  dan perbarui `seeded_at`; sesi serta identitas/`created_at`/`expires_at` workspace dipertahankan.

## Seed

Per workspace, relatif terhadap tanggal WIB saat dibuat/di-reset: 4 unit (PS4 A/B Rp15.000,
PS5 A/B Rp25.000), 14 booking contoh D-3…D+4 (yang sudah berakhir menjadi completed, 2 cancelled,
nama berlabel "(contoh)"), 2 blok. D+1 PS5 A/B 19.00–22.00 sengaja kosong untuk skenario PRD.
`npm run db:seed` membuat workspace lokal `contoh-lokal` untuk pengembangan.

## Data sementara

Data demo hanya untuk presentasi: workspace berlaku 12 jam, dihapus saat logout, dibersihkan
saat kedaluwarsa (saat login dan tiap 10 menit), dan bisa hilang seluruhnya bila file database
di hosting hilang (restart/redeploy). Tidak ada backup atau persistensi produksi.
