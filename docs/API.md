# API Sesi Play

Semua endpoint ada di bawah `/api`, satu origin dengan frontend. Respons JSON, `Cache-Control:
no-store`. Server adalah sumber kebenaran untuk tarif, total, slot, waktu WIB, status dan hak akses;
client tidak pernah mengirim workspace, peran, harga, total atau status sebagai otoritas.

## Konvensi

- **Sesi:** cookie `sesi_play_session` (HttpOnly, SameSite=Strict, Path=/api, Secure di HTTPS lewat
  proxy tepercaya). Token acak hanya disimpan sebagai SHA-256. Workspace dan peran selalu dari sesi.
- **Mutasi** (POST/PATCH/DELETE): bila dikirim, Origin harus origin aplikasi atau `ALLOWED_ORIGINS`;
  tanpa Origin, `Sec-Fetch-Site: cross-site` maupun `same-site` ditolak. Klien non-browser yang
  tidak mengirim Origin/Fetch Metadata tetap diizinkan (mis. curl). Body nonkosong wajib
  `application/json`, maksimal 100 KB setelah dekompresi.
  Tidak ada CORS (tidak ada `Access-Control-Allow-Origin`).
- **Waktu:** penyimpanan ISO UTC; input `date` (YYYY-MM-DD) dan `startTime` (HH:mm) dimaknai WIB.
- **Versi data:** respons bersesi membawa `X-Data-Version` (naik setelah reset demo).
- **Error:** `{ "error": { "code", "message", "fields"?, "requestId" } }`, tanpa stack trace.

| Status | Arti |
| --- | --- |
| 400 | Input tidak valid (`VALIDATION_ERROR`, `INVALID_JSON`, `INVALID_BODY`, `INVALID_URL`, `DATE_OUT_OF_RANGE`, `OUTSIDE_OPERATING_HOURS`, `START_TOO_SOON`, `INVALID_INTERVAL`, `START_IN_PAST`) |
| 401 | Tanpa sesi / sesi tidak berlaku (`UNAUTHENTICATED`, `SESSION_EXPIRED`) |
| 403 | Peran salah (`FORBIDDEN`) atau origin asing (`ORIGIN_REJECTED`) |
| 404 | Data tidak ada atau milik workspace lain (`BOOKING_NOT_FOUND`, `UNIT_NOT_FOUND`, `BLOCK_NOT_FOUND`, `NOT_FOUND`) |
| 409 | Konflik jadwal/status/idempotensi (`SLOT_UNAVAILABLE`, `IDEMPOTENCY_CONFLICT`, `QUOTE_CHANGED`, `UNIT_INACTIVE`, `BOOKING_STARTED`, `BOOKING_COMPLETED`, `BOOKING_NOT_ENDED`, `INVALID_STATUS`, `ALREADY_CANCELLED`, `BLOCK_OVERLAP`, `BLOCK_CONFLICT_BOOKING`, `UNIT_HAS_BOOKINGS`, `UNIT_NAME_TAKEN`, `UNIT_LIMIT_REACHED`, `SESSION_CHANGED`) |
| 413 | Body > 100 KB (`BODY_TOO_LARGE`) |
| 415 | Body bukan JSON / encoding tidak didukung (`UNSUPPORTED_MEDIA_TYPE`, `UNSUPPORTED_CHARSET`, `UNSUPPORTED_ENCODING`) |
| 429 | Batas rate per IP (`RATE_LIMITED`, header `Retry-After`) |
| 500 | Error internal (`INTERNAL_ERROR`), tanpa detail database/input privat |
| 503 | Kapasitas demo penuh (`DEMO_CAPACITY`) atau database sibuk (`DATABASE_BUSY`), dengan `Retry-After` |

## Publik

| Endpoint | Keterangan |
| --- | --- |
| `GET /api/health` | `{ status, service, database, timestamp }`; 503 bila database tidak terbaca |
| `GET /api/catalog` | Tanpa sesi: contoh publik read-only (`source: "sample"`, unit `id: null`), tidak membuat workspace/cookie. Dengan sesi: unit dan identitas workspace sendiri. Selalu memuat `rules`, `serverDate`, `bookableDates` (D…D+14 WIB) |
| `POST /api/demo/sessions` | Body `{ "role": "customer" \| "owner" }`. Tanpa sesi: workspace + seed + sesi baru (201; 503 bila 200 workspace aktif terpenuhi). Dengan sesi: ganti peran di workspace sama (200), masa berlaku tetap, token lama dicabut |

## Sesi

| Endpoint | Keterangan |
| --- | --- |
| `GET /api/session` | Peran, label, `expiresAt`, `workspace { createdAt, expiresAt, dataVersion }` |
| `DELETE /api/session` | 204; menghapus workspace milik token aktif beserta datanya; aman diulang |

## Booking (customer dan owner)

| Endpoint | Keterangan |
| --- | --- |
| `GET /api/availability?unitId=&date=&durationMinutes=60\|120\|180` | Slot 30 menit 10.00–23.00 WIB: `available`, `reason` (`past`, `lead_time`, `blocked`, `booked`, `unit_inactive`), `quote { id, hourlyRate, total }`, `serverTime`. Tidak memuat data pelanggan. Slot tidak ditahan |
| `POST /api/bookings` | Body `{ unitId, date, startTime, durationMinutes, customerName, phone?, idempotencyKey, quoteId? }`. Satu `BEGIN IMMEDIATE`: sesi diperiksa ulang, replay key, unit, waktu, konflik `[mulai, selesai)`, harga server, insert booking + key. 201 baru; 200 replay key+payload sama; 409 key sama payload beda; 409 `QUOTE_CHANGED` bila tarif berubah sejak quote |
| `GET /api/bookings/mine?view=upcoming\|finished\|cancelled&limit≤50&offset` | Booking asal pengunjung workspace sendiri (seed tidak termasuk), paginasi limit/offset |
| `GET /api/bookings/:id` | Customer: booking pengunjung workspace sendiri; owner: semua booking workspace sendiri. Lainnya 404. Detail berisi snapshot unit/tarif/total dan `payment: "pay_at_venue"` |
| `POST /api/bookings/:id/cancel` | Body `{ reason? }` (≤200). Customer hanya confirmed sebelum mulai; owner confirmed termasuk berlangsung. Ulang dengan alasan sama → 200 `changed: false` |

## Pemilik (owner saja)

| Endpoint | Keterangan |
| --- | --- |
| `GET /api/owner/agenda?date=&unitId=&status=` | Unit, booking tanggal itu (seed `isSample`), blok, `summary { bookingCount, ongoingCount, scheduledMinutes, reservationValue }`. Ringkasan mengikuti filter, tidak menghitung cancelled; sedang main = confirmed dengan mulai ≤ waktu server < selesai; nilai reservasi bukan pendapatan diterima |
| `PATCH /api/owner/bookings/:id/status` | Body `{ "status": "completed" }`; hanya confirmed yang sudah berakhir; terminal tidak berubah |
| `GET /api/owner/units` | Unit + `pendingBookings`, `maxUnits` (20) |
| `POST /api/owner/units` | `{ name (2–40), kind (PS4/PS5), hourlyRate (integer 1.000–1.000.000), isActive? }`; nama unik per workspace |
| `PATCH /api/owner/units/:id` | Subset field di atas; nonaktif ditolak 409 bila ada booking non-cancelled yang belum berakhir. Tidak ada hapus fisik |
| `GET /api/owner/blocks` | Blok yang belum berakhir + `bookableDates` |
| `POST /api/owner/blocks` | `{ unitId, date, startTime, endTime, note? }` grid 30 menit dalam jam buka/horizon, awal belum lewat; bentrok booking/blok 409 |
| `DELETE /api/owner/blocks/:id` | Hanya blok workspace sendiri |
| `PATCH /api/settings` | `{ businessName (2–60), address (2–150), contactNote (≤200) }`; jam buka/durasi tidak bisa diubah |
| `POST /api/demo/reset` | Body `{ "confirm": true }`. Atomik: hapus key, booking, blok, unit, pengaturan; `dataVersion + 1`; seed ulang. Sesi, peran, masa berlaku dan workspace lain tidak berubah |

`GET /api/settings` dapat dibaca semua peran di workspace sendiri.

## Batas demo

| Batas | Default | Env |
| --- | --- | --- |
| Pembuatan/ganti sesi per IP per 10 menit | 30 | `DEMO_SESSION_LIMIT` |
| Request API per IP per menit | 300 | `API_RATE_LIMIT` |
| Workspace aktif (dari database) | 200 | `DEMO_MAX_WORKSPACES` |
| Umur workspace/sesi | 720 menit | `DEMO_TTL_MINUTES` |

Rate limit disimpan di memori proses (hilang saat restart, tidak dibagi antarproses).
