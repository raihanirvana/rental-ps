# Backlog Sesi Play

13 tiket untuk demo booking rental PS **di tempat**, dikerjakan satu per satu.
RPS-001–RPS-005 **Selesai**. Tiket lain masih **Belum dimulai**.

Baca [PRD](../../PRD.md) dan [AGENTS.md](../../AGENTS.md) sebelum mulai.
Stack rencana: React + Vite, CSS, Express, SQLite, JavaScript ESM.
Fungsi maksimal 25 baris termasuk komentar/blank line/JSX; tanpa unit test.

## Urutan pengerjaan

Nomor menunjukkan urutan yang disarankan. Dependensi harus selesai terlebih dahulu.
P0 = alur inti dan keamanan; P1 = pelengkap demo dan publikasi. Dependensi tetap berlaku
meski prioritas berbeda; jangan melewati pengujian integrasi sebelum deployment.

| Tiket | Hasil utama | Prioritas | Dependensi | Status |
| --- | --- | --- | --- | --- |
| [RPS-001](RPS-001.md) | Fondasi aplikasi dan standar kode | P0 | — | Selesai |
| [RPS-002](RPS-002.md) | Database, migrasi dan seed relatif WIB | P0 | RPS-001 | Selesai |
| [RPS-003](RPS-003.md) | Sesi demo, peran dan isolasi workspace | P0 | RPS-002 | Selesai |
| [RPS-004](RPS-004.md) | Katalog dan mesin ketersediaan slot | P0 | RPS-003 | Selesai |
| [RPS-005](RPS-005.md) | Booking atomik, detail dan pembatalan | P0 | RPS-004 | Selesai |
| [RPS-006](RPS-006.md) | Landing, arah visual dan kerangka frontend | P0 | RPS-003, RPS-004 | Belum dimulai |
| [RPS-007](RPS-007.md) | Alur memilih slot dan konfirmasi booking | P0 | RPS-005, RPS-006 | Belum dimulai |
| [RPS-008](RPS-008.md) | Booking saya, detail dan batal | P0 | RPS-007 | Belum dimulai |
| [RPS-009](RPS-009.md) | Agenda pemilik dan penyelesaian sesi | P0 | RPS-005, RPS-006 | Belum dimulai |
| [RPS-010](RPS-010.md) | Pengelolaan unit dan blok jadwal | P0 | RPS-004, RPS-009 | Belum dimulai |
| [RPS-011](RPS-011.md) | Pengaturan usaha dan reset demo | P1 | RPS-008, RPS-010 | Belum dimulai |
| [RPS-012](RPS-012.md) | Integrasi, keamanan dan kesiapan demo | P0 | RPS-007, RPS-008, RPS-009, RPS-010, RPS-011 | Belum dimulai |
| [RPS-013](RPS-013.md) | Deployment gratis dan panduan presentasi | P1 | RPS-012 | Belum dimulai |

## Pembagian tahap

1. **RPS-001–005:** fondasi, database, sesi dan logika booking yang benar.
2. **RPS-006–008:** landing dan pengalaman pelanggan dari pilih slot sampai pembatalan.
3. **RPS-009–011:** agenda serta pengelolaan unit, blok dan data demo.
4. **RPS-012–013:** pemeriksaan integrasi, keamanan dan deployment yang benar-benar diuji.

## Cara mengerjakan

- Berikutnya **RPS-004 saja**; jangan membuat semua fitur sekaligus.
- Model sudah dikonfirmasi pemilik: main di tempat, booking PS/bilik per jam.
- Baca acceptance criteria, implementasikan, lalu jalankan check dan smoke check relevan.
- Isi bukti pada tiket: perubahan, perintah/skenario, hasil dan batasan. Lulus lint/build
  saja tidak membuktikan race condition, isolasi workspace atau deployment.
- Saat review, perbaiki bug dan ulangi pemeriksaan yang terdampak sebelum menandai Selesai.
- Perbarui status tabel dan tiket bersamaan. Commit/push mengikuti instruksi pemilik dan
  hanya jika repo/remote tersedia; perencanaan ini tidak membuat remote atau publikasi.

## Patokan demo akhir

Pengunjung dapat memilih unit/jam, membuat satu reservasi tanpa bentrok, melihat booking,
beralih ke agenda owner dan mereset ruangnya. Pengunjung lain tetap terisolasi. URL publik
beserta batas data sementara dijelaskan. Pembayaran tetap di tempat, tidak diproses aplikasi.
