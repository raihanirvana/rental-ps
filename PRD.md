# PRD — Sesi Play

Versi 1.0 · 15 Oktober 2026 · Status: rencana demo portfolio, belum diimplementasikan.

## 1. Ringkasan

Sesi Play adalah website demo untuk rental PlayStation **di tempat**. Pengunjung memilih
PS/bilik, tanggal dan durasi bermain, melihat jam tersedia, lalu membuat reservasi.
Pemilik mengelola agenda, unit dan waktu yang tidak bisa dipesan.

Tujuan proyek adalah menunjukkan contoh website bisnis yang bisa ditawarkan kepada
calon klien, sekaligus kemampuan fullstack: tampilan publik, alur pelanggan, pengelolaan
jadwal, dan pencegahan reservasi bentrok di server.

**Keputusan pemilik:** main di tempat, dengan booking PS/bilik per jam. Model ini
sudah dikonfirmasi dan menjadi dasar PRD serta seluruh tiket. Sewa konsol untuk dibawa
pulang berada di luar cakupan MVP.

Nama Sesi Play, lokasi dan tarif adalah contoh. Tidak mengklaim bisnis atau afiliasi
resmi dengan Sony/PlayStation. Pembayaran dilakukan di tempat; aplikasi tidak memproses
atau mencatat penerimaan uang.

## 2. Tujuan dan ukuran keberhasilan

| Tujuan | Bukti demo |
| --- | --- |
| Calon klien memahami fungsi website | Bisa mencoba reservasi tanpa membuat akun produksi |
| Menunjukkan manfaat untuk rental PS | Pelanggan melihat jam tersedia, pemilik melihat agenda yang sama |
| Membuktikan logika backend | Dua permintaan bertabrakan untuk unit sama hanya menghasilkan satu booking |
| Mendukung presentasi berulang | Reset mengembalikan data contoh di ruang demo sendiri |
| Melengkapi portfolio POS | Menunjukkan alur reservasi dan website pelanggan, selain aplikasi operasional |

Tidak menjanjikan peningkatan omzet, akuisisi pelanggan atau jumlah pemakai nyata.

## 3. Pengguna dan ruang demo

- **Pelanggan demo:** mencari slot, membuat, melihat, dan membatalkan bookingnya.
- **Pemilik demo:** melihat agenda serta mengelola booking, unit dan blok waktu.
- **Pengunjung landing:** melihat gambaran layanan dan data contoh tanpa sesi.

Landing dapat dibuka tanpa login. Tombol **Coba booking** atau **Coba sebagai pemilik**
membuat sesi demo dan workspace berisi data contoh. Workspace berlaku maksimal 12 jam.
Peran bisa diganti dalam workspace yang sama agar pengunjung melihat dua sisi alur.

Semua booking yang dibuat pelanggan dalam workspace itu adalah booking pengunjung demo
tersebut. Pemiliknya melihat contoh tambahan yang diberi penanda data contoh. Pengunjung
kedua mendapat workspace berbeda; tidak memakai jadwal global yang cepat penuh karena
orang lain sedang mencoba. Tab baru memakai cookie sesi yang sama.

Ini pergantian peran demo, bukan login produksi atau cara mengamankan bisnis sungguhan.
Tanpa sesi aktif, API personal meminta pengguna masuk demo lagi. Logout menghapus seluruh
workspace. Reset mengisi ulang workspace sendiri dan mempertahankan sesi/masa berlaku.

## 4. Cakupan MVP

| Prioritas | Fitur |
| --- | --- |
| P0 | Landing: identitas contoh, fasilitas, jenis PS, tarif dan tombol demo |
| P0 | Katalog unit: PS4/PS5, nama bilik, tarif per jam, status aktif |
| P0 | Pencarian slot berdasarkan unit, tanggal dan durasi |
| P0 | Booking dengan nama, nomor HP opsional, ringkasan harga dan nomor reservasi |
| P0 | Konfirmasi serta booking saya: mendatang, selesai dan dibatalkan |
| P0 | Pembatalan booking mendatang oleh pelanggan |
| P0 | Agenda pemilik menurut tanggal, unit dan status |
| P0 | Pengelolaan unit dan blok waktu oleh pemilik |
| P0 | Sesi demo terisolasi, reset, validasi dan pencegahan booking bentrok |
| P1 | Ringkasan operasional: booking hari ini, sesi berlangsung dan jam terjadwal |
| P1 | Pengaturan identitas usaha contoh dan panduan presentasi |
| P1 | Deployment demo gratis dan verifikasi URL publik |

Di luar MVP: sewa dibawa pulang, delivery, banyak cabang, pemilihan game online,
booking beberapa unit sekaligus, membership, deposit/denda, kupon, billing overtime,
perpanjangan sesi, akun/password pelanggan, payment gateway, notifikasi otomatis dan
sinkronisasi kalender eksternal.

## 5. Data contoh

Empat unit independen. Satu unit mewakili satu setup konsol, TV dan kontroler; tarif per
setup, bukan per orang. Seluruh nominal di bawah adalah contoh untuk demo.

| Unit | Jenis | Tarif per jam |
| --- | --- | --- |
| PS4 A | PS4 | Rp15.000 |
| PS4 B | PS4 | Rp15.000 |
| PS5 A | PS5 | Rp25.000 |
| PS5 B | PS5 | Rp25.000 |

Jam buka setiap hari **10.00–23.00 WIB**. Durasi tersedia **60, 120 atau 180 menit**.
Jam mulai berjarak **30 menit**. Tidak ada buffer antarsesi untuk MVP.

Seed membuat booking dan blok waktu relatif terhadap tanggal WIB saat workspace dibuat:
contoh masa lalu, hari ini dan beberapa hari berikutnya. Semua mengikuti jam buka dan
aturan konflik. Kalender baru tidak bergantung pada tanggal hardcoded yang kedaluwarsa.
Nama/data pelanggan contoh harus jelas merupakan ilustrasi; tidak ada kontak yang dikirimi pesan.

## 6. Alur pelanggan

1. Buka landing dan lihat fasilitas serta tarif contoh.
2. Klik **Coba booking**; server membuat ruang demo pelanggan bila belum punya sesi.
3. Pilih unit, tanggal dan durasi. Kalender menampilkan slot tersedia dari server.
4. Pilih jam; ringkasan menampilkan unit, waktu WIB, durasi dan perkiraan biaya.
5. Isi nama dan nomor HP opsional. Ada penjelasan bahwa ini demo dan tidak perlu data nyata.
6. Klik **Konfirmasi booking**. Server memeriksa ulang sesi, unit, slot, dan harga.
7. Jika berhasil, tampilkan nomor booking dan keterangan **Bayar di tempat**.
8. Buka **Booking saya** untuk detail atau pembatalan sebelum waktu mulai.

Memilih slot di browser **tidak menahannya**. Bila baru saja terisi, server mengembalikan
409 dengan pesan yang jelas; form pelanggan tetap ada dan daftar slot diperbarui.

Tombol konfirmasi dinonaktifkan selama request. Retry request yang sama memakai
idempotency key yang sama; mengganti unit/jam/durasi atau data booking membuat key baru.
Response gagal memuat tidak boleh otomatis membuat booking kedua.

## 7. Alur pemilik

- Masuk demo pemilik atau ganti peran dari workspace pelanggan yang sama.
- Lihat agenda harian, pilih unit/status dan buka detail reservasi.
- Batalkan reservasi dengan konfirmasi dan alasan opsional; tidak menghapus sejarah.
- Tandai booking berakhir sebagai selesai. Tidak ada status check-in untuk MVP.
- Tambah/edit unit, ubah tarif, nonaktifkan unit yang tidak memiliki booking aktif mendatang.
- Tambahkan blok waktu untuk maintenance atau pemakaian offline, lalu hapus blok bila selesai.
- Ubah nama/alamat/keterangan kontak usaha contoh; reset seluruh data dengan konfirmasi.

Status sesi sedang bermain dihitung dari waktu server dan interval reservasi, bukan
dari jam perangkat pengunjung atau tombol simulasi yang memajukan waktu.

## 8. Aturan booking dan waktu

### Jadwal

- Zona bisnis tetap **Asia/Jakarta (WIB)**; tampilkan WIB pada kalender, ringkasan dan detail.
- Tanggal booking adalah hari ini hingga **14 hari ke depan**, inklusif menurut WIB.
- Jam mulai harus pada kelipatan 30 menit dan minimal **15 menit setelah waktu server**.
- Seluruh sesi harus berada dalam satu hari operasional, mulai paling awal 10.00 dan
  selesai paling akhir 23.00. Contoh 22.00 selama 60 menit boleh; 22.30 selama 60 menit ditolak.
- Slot, harga dan jam server dihitung ulang saat konfirmasi, bukan dipercaya dari form.
- Penyimpanan waktu menggunakan UTC; API input tanggal/jam dimaknai eksplisit sebagai WIB.
  Parsing tanggal invalid seperti 31 Februari harus ditolak, bukan dinormalisasi diam-diam.

### Konflik

Interval memakai **[mulai, selesai)**: selesai pada 20.00 boleh disambung mulai 20.00.
Konflik terjadi bila `lama.mulai < baru.selesai` dan `lama.selesai > baru.mulai`.

Pemeriksaan mencakup booking yang tidak dibatalkan dan blok waktu pada **unit serta
workspace yang sama**. Jam mulai berbeda tetap bisa bentrok. Unit berbeda boleh dipesan
bersamaan. Tambah blok waktu yang menabrak booking aktif ditolak; tidak membatalkan booking
secara diam-diam. Data booking milik workspace lain tidak dibuka ke pengunjung.

Blok memakai tanggal dalam horizon yang sama, satu hari operasional, dan batas awal/akhir
kelipatan 30 menit. Waktu mulai tidak boleh lewat menurut server. Durasi blok boleh
kelipatan 30 menit hingga satu hari buka penuh; tidak dibatasi pilihan durasi booking.
Blok yang bertumpuk dengan blok lain juga ditolak 409.

### Harga dan perubahan data

- Harga = snapshot tarif per jam × durasi/60. Rupiah berupa bilangan bulat di server.
- Detail menyimpan nama unit, jenis, tarif dan total saat booking dibuat.
- Mengubah nama/tarif tidak mengubah booking lama. Tidak ada perubahan jam/unit/durasi
  pada booking yang sudah dibuat; batalkan lalu buat booking baru.
- Unit yang memiliki booking tidak dihapus fisik. Nonaktifkan hanya jika tidak ada
  booking non-cancelled yang belum berakhir; kalau ada, kembalikan 409 beserta penjelasan.
- Tarif valid: Rp1.000–Rp1.000.000 per jam. Nama unit 2–40 karakter. Unit maksimal 20 per workspace.
- Nama pelanggan 2–60 karakter; nomor HP opsional, bila diisi harus 8–15 digit dengan
  awalan + opsional. Batas karakter/kontrol dicek server dan frontend.

### Status

| Status | Arti | Transisi |
| --- | --- | --- |
| `confirmed` | Reservasi tercatat dan memblokir interval | Ke cancelled atau completed |
| `cancelled` | Reservasi dibatalkan; interval tersedia kembali jika masih bisa dipesan | Terminal |
| `completed` | Sesi telah berakhir dan ditandai selesai oleh pemilik | Terminal |

Pelanggan hanya membatalkan booking yang dibuatnya, masih confirmed dan belum mulai.
Pemilik boleh membatalkan confirmed, termasuk yang sedang berlangsung, tetapi tidak
mengubah completed/cancelled. Completed hanya boleh ditetapkan setelah waktu selesai.
Semua aturan transisi dicek ulang dalam transaksi, termasuk ketika request datang bersamaan.

Pembatalan menyimpan siapa yang membatalkan, kapan dan alasan opsional. Pengulangan
pembatalan dengan alasan yang sama mengembalikan keadaan cancelled yang sama tanpa efek baru.
Tidak ada biaya pembatalan atau label lunas pada demo ini.

## 9. Informasi yang terlihat

- Landing: contoh rental, unit/fasilitas, tarif, cara booking, jam buka, batas demo.
- Booking: langkah unit/tanggal/durasi/jam, ringkasan dan konfirmasi.
- Booking saya: nomor, unit, tanggal/jam, durasi, nilai reservasi, status, detail dan batal.
- Agenda pemilik: tanggal, unit, pelanggan, interval, status, blok dan detail.
- Unit/jadwal: tambah/edit/nonaktifkan unit serta tambah/hapus blok.
- Pengaturan: identitas usaha dan reset demo.

Ringkasan pemilik memakai istilah **nilai reservasi**, bukan omzet atau pendapatan,
karena aplikasi tidak mencatat pembayaran. Sesi berlangsung hanya confirmed dengan
mulai ≤ sekarang < selesai. Booking cancelled tidak menambah jam terjadwal.

Tidak pernah menampilkan nama/nomor pelanggan dalam respons ketersediaan slot.

## 10. Arah antarmuka

Website bisnis rental yang matang, mudah dibaca dan cepat menuju booking. Hindari
estetika gaming neon berlebihan, animasi dekoratif yang mengganggu, atau dashboard palsu.
Boleh memakai foto/ilustrasi fasilitas yang sesuai lisensi; jangan mengklaim lokasi,
ulasan atau pelanggan contoh sebagai bisnis nyata.

- Bahasa Indonesia, rupiah dan WIB. Target desktop dan ponsel; UI dibangun pada tiketnya.
- Pilihan unit mudah dibandingkan; kalender membedakan tersedia, terisi dan diblokir.
- Jam yang sudah tidak valid tidak bisa dipilih. Jangan mengandalkan warna saja.
- Ada loading, empty state, error, retry dan focus yang jelas.
- Label form, navigasi keyboard, dialog konfirmasi, kontras serta reduced motion diperhatikan.
- Arah visual menggunakan skill frontend-design, disusun sebelum implementasi UI.

## 11. Arsitektur rencana

Pola mengikuti POS: React + Vite + CSS biasa, Express dan SQLite (`node:sqlite`), JavaScript
ESM. Satu server menyajikan React serta `/api`, satu instance penulis database. Versi
Node/library dipastikan di RPS-001 sesuai environment yang berhasil menjalankan POS.

Pemisahan route → validasi → service → repository. Fungsi maksimal 25 baris termasuk JSX,
komentar dan blank line. Tidak membuat unit test; verifikasi lint/format/build, API dan browser.

### Entitas minimum

| Entitas | Data penting |
| --- | --- |
| workspaces | ID, createdAt, expiresAt, versi data/reset |
| sessions | Hash token, workspace, role customer/owner, expiresAt |
| business_settings | workspace, nama, alamat, teks kontak; jam buka tetap untuk MVP |
| units | workspace, nama, PS4/PS5, tarif, aktif/tidak, timestamps |
| bookings | workspace, unit, ID/ref, interval UTC, snapshot harga/unit, pelanggan, status, asal visitor/seed (visitor = booking pengunjung) |
| booking_requests | workspace + idempotency key unik, hash payload, booking hasil |
| unit_blocks | workspace, unit, interval UTC, catatan, timestamps |

Foreign key dan constraint menjaga relasi workspace, interval positif, enum status dan
nilai integer. Data contoh harus konsisten dengan aturan jadwal, bukan sekadar lolos INSERT.

### Kontrak API awal

Semua daftar berisi data workspace aktif. `GET /api/catalog` tanpa sesi hanya mengembalikan
contoh publik read-only; dengan sesi, mengembalikan katalog workspace itu. Read tidak
membuat workspace. Endpoint availability dan data personal memerlukan sesi.

| Endpoint | Akses / maksud |
| --- | --- |
| GET /api/health | Publik; kesehatan server/database tanpa data rahasia |
| POST /api/demo/sessions | Publik; body role customer/owner, membuat atau mengganti peran |
| GET /api/session; DELETE /api/session | Baca sesi / logout dan hapus workspace |
| GET /api/catalog | Contoh publik atau katalog workspace aktif |
| GET /api/availability?unitId=&date=&durationMinutes= | Sesi customer/owner; jam mulai dan alasan ketidaktersediaan |
| POST /api/bookings | Customer/owner; membuat booking pelanggan dengan idempotency key |
| GET /api/bookings/mine; GET /api/bookings/:id | Booking pelanggan sesi sendiri / detail sesuai hak akses |
| POST /api/bookings/:id/cancel | Customer untuk booking miliknya; owner untuk workspace sendiri |
| GET /api/owner/agenda | Owner; filter tanggal/unit/status dan ringkasan |
| PATCH /api/owner/bookings/:id/status | Owner; hanya menetapkan completed sesuai aturan |
| POST/PATCH /api/owner/units[/:id] | Owner; tambah/edit/nonaktifkan unit |
| POST/DELETE /api/owner/blocks[/:id] | Owner; tambah/hapus blok jadwal |
| GET/PATCH /api/settings | Sesi baca / owner ubah identitas usaha |
| POST /api/demo/reset | Owner; reset data workspace secara atomik |

POST booking menerima `unitId`, `date` (YYYY-MM-DD), `startTime` (HH:mm),
`durationMinutes`, `customerName`, `phone` opsional, dan `idempotencyKey`.
Field `workspaceId`, harga/total, role dan status dari client ditolak, bukan dipercaya.
Owner membuat booking manual dengan kontrak sama; untuk demo ini booking manual itu
terlihat di booking saya ketika peran diganti. Seed dibedakan dari booking pengunjung.
Customer hanya dapat membuka detail booking asal pengunjung dalam workspace sendiri;
detail seed dan ID workspace lain mengembalikan 404. Owner dapat membuka seluruh booking
workspace sendiri, termasuk seed.

Rute `/mine` didaftarkan sebelum `/:id`. Error JSON konsisten: kode, pesan, requestId dan
fields opsional. 400 invalid, 401 sesi, 403 role/origin, 404 data tak ditemukan/asing,
409 slot/status/idempotency konflik, 429 rate, 503 kapasitas. Respons API personal no-store.

### Transaksi booking

Satu transaksi `BEGIN IMMEDIATE` mencakup pemeriksaan ulang sesi setelah kunci tulis,
idempotency key, unit aktif, batas waktu, konflik booking/blok, perhitungan harga,
INSERT booking serta penyimpanan hasil idempotency. Validasi bentuk input boleh di luar
transaksi; validasi keadaan/waktu harus memakai keadaan terbaru di dalamnya.

Key sama + payload sama → booking yang sama (200 replay, 201 saat pertama). Key sama +
payload berbeda → 409. Kegagalan tidak meninggalkan booking atau key setengah jadi.
Respons replay tidak membuat booking baru setelah yang lama dibatalkan; ia mengacu ke
booking asli dengan status terkini. Reset menghapus riwayat key workspace secara atomik.

Mutasi unit, blok, status, cancel dan reset mengikuti disiplin transaksi yang sama.
Tangani database busy secara terkendali; jangan mengubah konflik jadwal menjadi error 500.

## 12. Keamanan dan batas demo

- Token acak disimpan sebagai hash; cookie HttpOnly, SameSite=Strict, Path=/api, Secure
  pada HTTPS melalui proxy yang dipercaya. Role/workspace hanya dari sesi server.
- Sesi default 12 jam; ganti peran tidak memperpanjang umur workspace. Token lama dicabut.
- Mutasi wajib origin yang diizinkan dan body JSON untuk endpoint yang memiliki body.
  Jangan memakai CORS wildcard dengan cookie. DELETE tanpa body tetap diperiksa originnya.
- Query berparameter, penolakan field asing, validasi tanggal/jam, batas body 100 KB.
- Batas awal: 30 pembuatan/ganti sesi per IP per 10 menit, 300 API request/IP/menit,
  maksimal 200 workspace aktif. Rate limit memori per proses, kapasitas dari database.
- Hindari menyimpan token, cookie, nama atau nomor HP pada log. Pakai requestId untuk error.
- Header keamanan/CSP disesuaikan dengan aset lokal dan satu origin aplikasi.
- Nomor HP opsional; demo tidak mengirim notifikasi atau memerlukan data pribadi nyata.

## 13. Kriteria penerimaan

Gunakan D sebagai tanggal WIB server saat diuji. Contoh berikut memakai D+1 agar tidak
menjadi skenario kedaluwarsa. Uji dengan database dan port sementara.

| Skenario | Hasil yang wajib |
| --- | --- |
| PS5 A Rp25.000/jam, D+1 19.00 selama 120 menit | Total Rp50.000; selesai 21.00 WIB; nomor booking dibuat |
| Unit/jam sama, dua request berbeda bersamaan | Satu berhasil; satu 409; database hanya menambah satu booking |
| Booking pertama 19.00–21.00, request kedua 20.30–21.30 | Ditolak meskipun jam mulai berbeda |
| Booking berikutnya 21.00–22.00 | Boleh karena interval bersebelahan |
| PS5 B pada 19.00–21.00 | Boleh; unit berbeda |
| Slot diblokir owner | Tidak tersedia; konfirmasi langsung lewat API juga ditolak |
| Blok baru menabrak booking aktif | 409; booking tidak dibatalkan diam-diam |
| Jam 22.30 selama 60 menit | 400 di luar jam operasional |
| Tanggal lewat, terlalu jauh, invalid atau waktu <15 menit ke depan | Ditolak server; slot tidak ditawarkan |
| Kirim harga/total/status/workspaceId palsu | Ditolak; otorisasi serta harga tetap server |
| Timeout lalu retry dengan key/payload sama | Tetap satu booking; respons memuat booking asli |
| Key sama dengan jam berbeda | 409, tidak membuat booking kedua |
| Customer membatalkan sebelum mulai | Cancelled, jadwal bebas kembali jika masih bisa dipesan |
| Customer membatalkan setelah mulai | Ditolak; tidak mengubah status |
| Unit/tarif berubah setelah booking | Detail lama tetap memakai snapshot asli |
| Unit dinonaktifkan saat masih ada booking mendatang | 409; unit tetap aktif |
| Dua pengunjung demo | Jadwal, booking dan reset satu pengunjung tidak memengaruhi yang lain |
| Reset bersamaan request booking | Data konsisten; UI tidak menampilkan response lama sebagai booking setelah reset |
| Refresh/tab baru | Sesi dan data tersedia selama workspace dan file database masih ada |
| Sesi habis / data hosting hilang | Kembali ke masuk demo dengan penjelasan; tidak menampilkan data pengunjung lain |

## 14. Hosting dan keterbatasan

Rencana pertama adalah satu Node Web Service gratis di Render, mengikuti pendekatan
POS, dengan SQLite sementara. Jam, kuota, lokasi, runtime dan kebutuhan akun diverifikasi
saat RPS-013; tidak menjanjikan hosting gratis tanpa batas atau uptime produksi.

Sleep, restart atau redeploy dapat menghapus seluruh sesi dan booking demo lebih cepat
dari TTL. Setelah itu pengunjung membuat workspace baru. Batas ini dijelaskan di landing
serta README. Tidak ada klaim persistensi/backup produksi atau layanan berbayar yang
boleh dibuat tanpa instruksi pemilik.

## 15. Urutan pengerjaan dan definisi selesai

Rincian di [backlog](docs/tickets/README.md). RPS-001 sampai RPS-013 dikerjakan satu per
satu. Awali dengan fondasi, lalu data/sesi, ketersediaan dan transaksi booking sebelum UI.

Tiket selesai jika acceptance criteria terpenuhi, lint/format/build lolos, verifikasi API
atau browser yang relevan dicatat, dan tidak ada rahasia/database/runtime yang di-commit.
Proyek demo lengkap hanya setelah alur pelanggan-pemilik dan URL publik benar-benar diuji.
