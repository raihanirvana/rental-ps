# Sesi Play — acuan desain

Status: **proposal visual v1, siap ditinjau**, bukan persetujuan desain final dan bukan
implementasi RPS-006. Disusun memakai skill frontend-design untuk model yang sudah dipilih:
**main di tempat, booking PS/bilik per jam**.

## Mulai dari sini

Lihat prototype sebelum mengimplementasikan UI. Tiga layar memakai HTML/CSS/JS biasa,
font lokal dan data ilustrasi. Tidak ada panggilan API, cookie, localStorage atau transaksi.
Prototype terpisah dari aplikasi React. Implementasi landing/booking ada di `client/src/`;
lihat catatan implementasi pada bagian 13.

```bash
cd /Users/23061535/rental-ps
python3 -m http.server 4179 --bind 127.0.0.1 --directory docs/design
```

Buka `http://127.0.0.1:4179/`. Tidak perlu menjalankan backend untuk melihat desain.
Hentikan server dengan Ctrl+C setelah selesai. Port boleh diganti jika dipakai proses lain.

| Acuan visual | Isi |
| --- | --- |
| [Landing](docs/design/index.html) | Identitas, contoh papan jadwal, fasilitas, tarif dan cara booking |
| [Booking](docs/design/booking.html) | Pilihan unit, tanggal/durasi, slot, ringkasan dan contoh konfirmasi |
| [Agenda pemilik](docs/design/owner.html) | Jadwal empat unit, blok, ringkasan dan detail |
| [Token dan CSS](docs/design/styles.css) | Ukuran, warna, tipografi, breakpoint dan state dasar |
| [Interaksi prototype](docs/design/preview.js) | Contoh interaksi browser; bukan service booking |
| [Catatan verifikasi](docs/design/README.md) | Batas prototype dan hasil pemeriksaan visual |

## 1. Arah: ruang main, papan jadwal

Sesi Play terasa seperti rental yang teratur dan nyaman. Hal paling khasnya adalah
**waktu main pada setiap setup**, sehingga jadwal menjadi elemen utama, bukan gambar
konsol raksasa atau dashboard angka yang tidak membantu pelanggan memilih jam.

Gunakan ruang putih, judul padat, satu aksen biru, dan informasi operasional yang jelas.
Sederhana tidak berarti kosong: ada pilihan unit, harga, jam dan alasan slot tidak bisa dipilih.

Rencana sempat mempertimbangkan hero controller dan deretan kartu fitur. Keduanya diganti
papan jadwal empat unit: lebih menjelaskan bisnis, cocok untuk alur reservasi, dan memberi
identitas yang berbeda dari POS maupun portfolio personal. Foto tidak diperlukan pada v1.

- Satu elemen kuat: papan waktu. Elemen lain mendukung tugas pengunjung.
- Susunan dominan rata kiri, termasuk judul, ringkasan dan form. Angka total rata kanan.
- Warna mengodekan tindakan/status, bukan dekorasi. Status selalu punya teks.
- Nomor hanya pada urutan booking yang benar-benar berurutan.
- Hindari neon, gradient dekoratif, glow, judul berwarna per kata, label kapital dengan
  tracking lebar, testimonial palsu dan animasi pada setiap bagian.

## 2. Token warna

Enam warna inti; nilai yang sama ada pada `styles.css`. Warna semantik tambahan hanya
untuk keadaan yang memerlukan perbedaan arti.

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `--paper` | `#F3F6FA` | Latar halaman, permukaan tenang |
| `--surface` | `#FFFFFF` | Form, jadwal, dialog, ringkasan |
| `--ink` | `#243247` | Judul, isi, nilai utama |
| `--muted` | `#55657A` | Teks pendukung yang tetap terbaca |
| `--blue` | `#3456BE` | Tindakan utama, slot dipilih, sesi berlangsung |
| `--blue-wash` | `#E7EDFC` | Pilihan unit/durasi, reservasi mendatang, pesan informasi |

Tambahan: garis `#D9E1EC`; sukses `#246349` di `#E8F2EC`; error `#A72C40` di
`#FCEFF1`; focus ring `#2448B4`. Putih dipakai untuk teks pada biru solid. Gunakan token,
bukan menambah biru/abu baru per komponen. Hatch diagonal menandakan blok maintenance.

Jangan mengurangi opacity seluruh teks agar terlihat halus. Muted tetap memakai token
warna solid. Disabled punya teks alasan, bukan sekadar warna yang pudar.

## 3. Tipografi dan ukuran

- **Barlow Semi Condensed 600:** judul halaman dan heading utama; bentuk rapat mengingatkan
  label waktu/ruang bermain, tanpa huruf futuristik yang sulit dibaca.
- **Manrope 400/600/700:** isi, navigasi, form, tabel dan harga. Gunakan tabular numerals
  untuk data waktu/harga pada implementasi React.
- Font berada di `docs/design/fonts/`, beserta lisensi OFL dan sumber di README desain.
  Saat implementasi, salin ke `client/public/fonts/`; tidak memakai font CDN runtime.

| Peran | Desktop | Ponsel | Ketentuan |
| --- | --- | --- | --- |
| Hero | 78px / 1.02 | 62px / 1.02 | Barlow 600; jangan lebih dari tiga baris |
| Judul aplikasi | 50px / 1.02 | 43px / 1.02 | Barlow 600 |
| Judul bagian | 44px / 1.05 | 38px / 1.05 | Barlow 600 |
| Subjudul/form heading | 14–19px / 1.4 | 14–19px / 1.4 | Manrope 700 |
| Isi utama | 14–15px / 1.65 | 14px / 1.65 | Manrope 400 |
| Pendukung | 12–13px / 1.65 | 12px / 1.65 | Jangan pakai untuk instruksi penting |
| Caption jadwal | 10–11px / 1.5 | 10–11px / 1.5 | Hanya metadata; jam/form tetap jelas |

Batasi paragraf sekitar 45–65 karakter per baris. Heading memakai tracking sekitar
-0.025em, body normal. Harga `Rp25.000`, jam `19.00–21.00 WIB`, tanggal berbahasa Indonesia.

## 4. Ukuran, jarak dan bentuk

- Lebar pembungkus maksimum **1216px termasuk padding**. Padding desktop 40px, tablet
  28px, ponsel 20px. Isi efektif desktop maksimum 1136px.
- Skala jarak dasar 4px: 4/8/12/16/20/24/32/40/56/64. Ikuti CSS sebagai acuan terukur;
  beberapa gap optis 26–28px boleh dipertahankan.
- Radius: field/slot 6px, button 7px, panel 10px, hero jadwal 14px. Tidak semua elemen pill.
- Garis 1px untuk pengelompokan nyata. Shadow hanya ringan pada papan jadwal hero.
- Tombol/input minimum tinggi 44px, tombol utama 46px. Slot minimal 57px.
- Logo teks `sesi play`, simbol play/pause sederhana milik demo; bukan logo PlayStation resmi.
- Ilustrasi unit berupa diagram SVG kecil sebagai pembeda setup, bukan gambar hero.

## 5. Landing

Tujuan: pengunjung langsung memahami rental di tempat dan mencoba memilih jam.

```text
sesi play                  Unit & tarif   Cara booking   Coba sebagai pemilik

Rental PS di tempat          Jam kosong, sekali lihat.
Jam mainmu,                  PS4 A | terisi | kosong | diblokir |
sudah ada tempatnya.         PS4 B | terisi | kosong | kosong  |
                             PS5 A | terisi | pilihanmu 19–21 |
Pilih PS4/PS5 dan jam.        PS5 B | kosong | kosong | terisi |
[Coba booking] Lihat tarif    PS5 A, dua jam / Rp50.000

10–23 WIB       Dua kontroler       TV per unit       Bayar di tempat

Pilih PS4 atau PS5.                         Tarif per setup, bukan per orang
[diagram kecil PS4 / dua unit / Rp15rb] [diagram kecil PS5 / dua unit / Rp25rb]

Beres sebelum berangkat.    1 Pilih jadwal   2 Konfirmasi   3 Datang dan main

Penjelasan bisnis contoh dan data sementara                 Sisi pemilik
```

Hero desktop dua kolom sekitar 1:1.05 dengan gap 64px; ponsel bertumpuk, judul lebih dulu,
papan jadwal berikutnya. Jadwal hero berlabel **ilustrasi**, bukan janji slot masih tersedia.

CTA utama konsisten **Coba booking**; di aplikasi jadi membuat sesi customer lalu membuka
booking. CTA pemilik jelas menyebut demo. Landing anonim hanya GET katalog, tidak membuat
workspace otomatis. Tautan PS4/PS5 dapat membawa pilihan awal ke alur booking.

Fasilitas ditampilkan sebagai satu baris informasi, bukan empat kartu. Dua panel tarif
punya fungsi membandingkan PS4 dengan PS5; jangan ditambah kartu generik “mudah/cepat/aman”.
Tidak ada alamat fiktif yang seolah bisa didatangi atau daftar game yang belum dikelola.

## 6. Booking pelanggan

```text
sesi play                                  Beranda   Booking saya   Pelanggan demo
Tentukan jam main.                              1 Jadwal  2 Data diri  3 Konfirmasi

┌────────────────────────────────────────┐ ┌───────────────────────┐
│ Pilih unit: PS4 A / PS4 B / PS5 A / B  │ │ PS5 A                 │
│ Tanggal          Durasi 1 / 2 / 3 jam  │ │ Rencana mainmu        │
│ Pilih jam mulai                  WIB  │ │ Tanggal / jam / tarif │
│ [10.00] [10.30] [11.00] [11.30] ...   │ │ Total         Rp50rb  │
│ Terisi / diblokir diberi alasan teks  │ │ [Lanjut isi data]     │
│ Jam belum ditahan                    │ │ Bayar di tempat       │
└────────────────────────────────────────┘ └───────────────────────┘
```

Desktop: kolom fleksibel dan ringkasan 312px, gap 28px. Ringkasan sticky top 25px.
Tablet ringkasan 270px; ponsel satu kolom, ringkasan di bawah slot, tidak menutupi konten.

Pilihan unit/durasi memakai radio native dengan label seluruh bidang. Pilihan slot adalah
button dengan `aria-pressed`; bukan div klik. Enam kolom jam desktop, empat tablet/ponsel.
Jam yang bertabrakan tetap terbaca dengan `Terisi`, `Diblokir` atau `Tutup`.

Lanjut membuka form nama dan HP opsional. Nama wajib, HP boleh kosong; teks demo menganjurkan
nama contoh. Fokus pindah ke heading form. Tombol akhir aplikasi jadi **Konfirmasi booking**.
Prototype sengaja memakai **Lihat contoh konfirmasi**, agar tidak mengklaim menyimpan booking.

Konfirmasi final aplikasi memuat nomor server, snapshot unit, tanggal/jam WIB, total dan
Bayar di tempat; tautan Booking saya. Dialog prototype hanya mencontoh hierarkinya.

## 7. Agenda pemilik

Header ringan dan nav horizontal: Agenda, Unit & jadwal, Pengaturan. Tidak ada sidebar
besar untuk tiga menu. Judul, tanggal dan tindakan tambah booking di atas papan jadwal.
Ringkasan hanya jumlah booking, sedang main dan jam terjadwal; bukan deretan kartu KPI.

Desktop menampilkan empat baris unit dan waktu secara horizontal. Posisi/lebar reservasi
mewakili jam mulai dan durasi. Timeline prototype adalah **potongan 16.00–23.00**; aplikasi
jadi harus bisa menjelajahi seluruh **10.00–23.00**, dengan label batas 23.00 yang jelas.
Reservasi terlalu sempit membuka detail; teks lengkap tetap ada pada accessible name.

Ponsel menggunakan daftar kronologis yang menyebut unit, nama, interval dan status.
Jangan sekadar mengecilkan timeline. Filter unit/status, paginasi bila relevan, dan tombol
Hari ini ditambahkan pada RPS-009 dengan komponen field/button yang sama.

Biru solid = sedang main; biru muda = reservasi confirmed mendatang; hijau tenang = selesai;
hatch = blok. Label cancelled pada riwayat berwarna muted, bukan merah darurat. **Sedang
main adalah turunan waktu server**, bukan status database baru atau tombol check-in.

Contoh ringkasan prototype: empat reservasi, tujuh jam, satu sedang main, nilai Rp145.000.
Ini data ilustrasi tetap dengan jam contoh 19.30 WIB. Bukan penghitung live atau pendapatan.

## 8. Layar lanjutan mengikuti bahasa yang sama

| Layar | Struktur yang dipertahankan |
| --- | --- |
| Booking saya | Daftar ringan: nomor, snapshot unit, interval, total, status; detail membuka dialog; kartu berlabel di ponsel |
| Unit & jadwal | Daftar unit bertarif dan status aktif; form tambah/edit; blok waktu punya unit, tanggal, mulai/akhir dan alasan |
| Pengaturan | Form identitas usaha di panel putih; reset ditempatkan terpisah dengan konfirmasi kehilangan data |
| Ganti peran | Kontrol berlabel Coba sebagai pemilik/pelanggan; jelaskan data tetap di ruang demo sendiri |
| Sesi habis | Halaman singkat dengan CTA Mulai demo lagi; jangan redirect berulang atau menyalahkan pengguna |

Dialog desktop maksimum sekitar 440px. Dialog konfirmasi panjang boleh 560px. Ponsel boleh
bottom sheet, maksimal 90dvh, scroll konten di dalam, heading/action tetap bisa dijangkau.
Jangan mengubah semua halaman menjadi popup: memilih jadwal membutuhkan halaman sendiri.

## 9. State dan copy wajib

| State | Tampilan dan teks | Tindakan |
| --- | --- | --- |
| Memuat slot | Pertahankan form; area slot aria-busy, pesan “Memuat jam tersedia…”; ringkasan tidak boleh bisa submit hasil lama | Tunggu; jangan kedipkan seluruh halaman |
| Tidak ada slot | Pesan “Belum ada jam kosong untuk durasi ini.” | Ubah tanggal, durasi atau unit |
| Error daftar/slot | Panel informasi error: “Jam tersedia belum bisa dimuat.” | Coba lagi; isian tetap ada |
| Slot direbut/409 | Pesan dekat slot: “Jam ini baru saja terisi. Pilih jam lain.” | Refresh slot, lepas pilihan lama, pertahankan nama/HP |
| Harga berubah | Ringkasan memperlihatkan tarif terbaru sebelum konfirmasi ulang | Minta pengguna meninjau ulang; jangan diam-diam menyetujui biaya baru |
| Submit | Tombol “Menyimpan booking…” disabled; cegah double click | Retry timeout memakai key yang sama |
| Berhasil | Nomor reservasi dari server, snapshot dan “Bayar di tempat” | Booking saya atau Buat booking lain |
| Gagal validasi | Pesan tepat di bawah field, `aria-invalid` dan `aria-describedby` | Fokus ke field invalid pertama |
| Nama belum diisi | “Isi nama pemesan, minimal 2 karakter.” | Isian lain tidak hilang |
| Nomor tidak valid | “Gunakan 8–15 digit, boleh diawali +, atau kosongkan.” | Tanpa input type number yang menghilangkan +/nol awal |
| Batal booking | Dialog menyebut unit, jam dan konsekuensi slot tersedia lagi | Kembali / Batalkan booking |
| Reset demo | “Kembalikan data contoh? Booking dan perubahan di ruang demo ini akan dihapus.” | Kembali / Reset demo |
| Workspace penuh/rate | Pesan server yang aman dan jelas | Coba nanti, hormati Retry-After |
| Sesi habis/data hilang | “Ruang demo sudah berakhir. Mulai demo baru untuk mencoba lagi.” | Mulai demo lagi |

Prototype memvisualkan state normal, selected, disabled beserta alasan, dialog detail dan
konfirmasi. State error/loading di tabel ini **spesifikasi untuk implementasi**, bukan fitur
server yang sudah selesai. Gunakan toast hanya untuk konfirmasi pendek; error form tetap inline.

## 10. Aksesibilitas dan perilaku

- Label eksplisit, hierarchy heading, skip link, nav berlabel dan current page/step.
- Focus ring biru 3px, offset 4px. Jangan hapus outline tanpa pengganti.
- Radio native: arrow keys untuk pilihan unit/durasi. Slot button bisa Tab/Enter/Space.
- Dialog native atau padanannya wajib focus trap, Escape dan restore focus. Latar inert.
- Perubahan slot/ringkasan diumumkan lewat live region yang ringkas pada aplikasi jadi;
  jangan membuat setiap sel berbicara sekaligus. Loading menggunakan aria-busy.
- Reduced motion mematikan transisi/animasi. Tanpa auto carousel, parallax atau blink status.
- Pada 360/768/1280px, tidak ada overflow halaman. Timeline tablet boleh scroll di region
  berlabel; tampilan ponsel menjadi daftar.
- Saat filter memuat, label halaman dan data tetap mewakili hasil server yang sedang tampil.

## 11. Batas prototype dan aturan integrasi

**PRD serta API adalah otoritas aturan bisnis. Prototype hanya acuan visual.**

Jangan membawa tanggal 16 Oktober 2026, nomor SP-CONTOH, fixture pelanggan, jam contoh,
`slotReason()` atau logika harga JS prototype sebagai sumber kebenaran aplikasi.
Tanggal/horizon, WIB, quote, availability, status dan total harus memakai server.

Tidak membuat status database baru seperti ongoing/paid. Tidak memakai localStorage untuk
booking atau sesi. Tidak mengirim workspaceId/harga/role dari form sebagai otoritas. Jangan
meniru mock interaksi seolah backend lengkap atau memakai API health sebagai isi landing.

Saat menjadi React, bagi komponen menurut tanggung jawab, misalnya:
`SiteHeader`, `DemoNotice`, `LandingSchedulePreview`, `UnitOffer`, `BookingUnitPicker`,
`DurationPicker`, `SlotGrid`, `SlotButton`, `BookingSummary`, `CustomerFields`,
`BookingConfirmation`, `OwnerAgenda`, `AgendaLane`, `BookingDetail`.

Setiap fungsi, callback dan komponen maksimal 25 baris **setelah format**, termasuk JSX,
komentar dan blank line. Jangan memadatkan JSX untuk lolos lint. Pecah panel besar dengan
komponen yang bermakna; pisahkan fetching/state dari komponen presentasi. Tidak perlu
menambah Tailwind, UI kit atau library animasi untuk menyalin acuan ini.

## 12. Instruksi siap diberikan ke Claude

> Baca AGENTS.md, PRD.md, DESIGN.md dan tiket yang sedang dikerjakan. Jalankan prototype
> docs/design untuk melihat tiga layar dan screenshot pembanding. Gunakan tipografi,
> token warna, hierarki, proporsi dan copy di acuan ini. Implementasikan hanya tiket yang
> diminta, dengan React/CSS proyek yang sudah ada, bukan mengganti arsitektur backend.
> Prototype adalah referensi visual; data, availability, quote dan mutasi berasal dari API
> sesuai PRD. Jangan mengubah tanggal/fixture contoh menjadi business logic produksi.
> Terapkan loading/empty/error/conflict/expired serta aksesibilitas pada saat alur terkait
> diimplementasikan. Semua fungsi maksimal 25 baris termasuk JSX dan blank line; tanpa
> unit test. Jalankan npm run check dan smoke check browser/API sesuai tiket. Jangan
> menandai RPS-006 selesai hanya karena prototype sudah ada. Catat perbedaan yang perlu
> dibuat karena data nyata; pertahankan bahasa visualnya.

Mulai implementasi UI ketika dependensi tiketnya siap. Desain ini tidak mengubah status
RPS-004/005/006 dan tidak mengotorisasi implementasi seluruh backlog sekaligus.

## 13. Catatan implementasi RPS-006

Token, tipografi (Barlow Semi Condensed 600 + Manrope, font lokal di `client/public/fonts/`
beserta lisensi OFL), proporsi dan copy landing mengikuti bagian 2–5. CSS dibagi menjadi
`client/src/styles/{base,controls,landing,app}.css`; komponen landing ada di
`client/src/components/landing/`.

Perbedaan karena data nyata dan kebutuhan demo:

- Unit dan tarif landing berasal dari `GET /api/catalog` (contoh publik tanpa sesi,
  katalog workspace dengan sesi), dikelompokkan per jenis. Jam buka dari `rules` server.
- Papan jadwal hero tetap ilustrasi statis dengan label "Ilustrasi, bukan slot tersedia".
- Penjelasan demo (tanpa akun, data sementara 12 jam, bayar di tempat) tampil sebagai daftar
  pendek di bawah CTA sebelum pengunjung menekan tombol apa pun.
- Header aplikasi: nav per peran, label peran, "Coba sebagai pemilik/pelanggan" dan
  "Keluar demo" (dialog konfirmasi), ditambah bar demo berisi masa berlaku ruang demo WIB.
- Layar status (memuat, gagal cek sesi, belum masuk, sesi berakhir, peran tidak sesuai,
  404) memakai judul Barlow dan satu tindakan utama, tanpa redirect berulang.

### Implementasi RPS-007 (booking pelanggan)

- Struktur §6 diikuti: panel jadwal (unit radio, tanggal, durasi, grid slot 6/4 kolom) dan
  ringkasan sticky 312px; ponsel satu kolom dengan ringkasan di bawah.
- Grid hanya memuat jam yang server tawarkan (mulai 10.00, selesai ≤ 23.00), sehingga
  sel "Tutup" pada prototype tidak ada. Alasan lain tertulis: Terisi, Diblokir, Lewat,
  Terlalu dekat, Nonaktif.
- Form data diri muncul di bawah slot setelah **Lanjut isi data**; fokus ke heading form.
  Tombol akhir **Konfirmasi booking**; konfirmasi tampil di halaman (bukan dialog) dengan
  snapshot server, "Bayar di tempat", tautan Booking saya dan Buat booking lain.

### Perbaikan hasil review RPS-006–007

Harga berubah kini ditangani sebelum reservasi tersimpan: availability memberikan quote ID,
frontend menyertakannya saat konfirmasi, dan server membandingkannya di dalam transaksi.
Jika berbeda, tampilkan pesan QUOTE_CHANGED dekat jadwal, refresh harga/slot, lepas pilihan
jam dan pertahankan isian pelanggan. Pengguna memilih jam serta mengonfirmasi lagi.
Label tarif unit dan ringkasan mengikuti hasil availability terbaru, bukan katalog lama.

Respons sesi lama tidak menimpa sesi baru. Respons JSON booking rusak/body timeout menampilkan
error yang dapat diulang dengan key sama; tidak berpindah ke konfirmasi kosong. Lihat
[catatan review](docs/REVIEW-RPS-006-007.md) untuk verifikasi dan batasnya.

### Implementasi RPS-008 (booking saya)

- Daftar ringan per booking (nomor, status tertulis, unit snapshot, jadwal WIB, durasi,
  nilai reservasi) dengan tab Mendatang/Riwayat/Dibatalkan dan paginasi 10 per halaman;
  tab dan halaman disimpan di URL (`?tampil=&halaman=`). Ponsel: kartu berlabel.
- Detail memakai **halaman** `/booking-saya/:id`, bukan dialog seperti tabel §8, agar refresh,
  tab baru dan URL langsung (termasuk 404 untuk seed/workspace lain) bekerja tanpa state
  tersembunyi. Pembatalan tetap memakai dialog konfirmasi dengan alasan opsional.

### Implementasi RPS-009 (agenda pemilik)

- Timeline penuh 10.00–23.00 (26 kolom 30 menit) dalam region ber-scroll berlabel; item
  memakai nama yang dibacakan lengkap (unit, nama, jam, status, data contoh). Teks item
  1 jam bisa terpotong secara visual; detail lengkap ada di dialog.
- Warna: biru solid sedang main, biru muda reservasi, putih bergaris putus "Menunggu
  selesai" (confirmed yang sudah lewat), hijau selesai, hatch blok. Booking dibatalkan
  tidak digambar di timeline; tampil di daftar "Booking dibatalkan" di bawahnya.
- Ponsel: daftar kronologis seluruh item. Filter tanggal (‹ › Hari ini), unit dan status
  disimpan di URL. Ringkasan satu baris + catatan "Bukan pendapatan diterima".
- Tombol "Tambah booking" pada prototype belum dibuat (bukan kriteria RPS-009).

### Implementasi RPS-010 (unit & jadwal)

- Dua bagian bertumpuk: Unit dan Blok jadwal. Desktop: daftar ringan di kiri, form di panel
  putih 360px di kanan; ≤1000px satu kolom. Tombol baris memakai teks tersembunyi
  ("Ubah PS4 A") agar jelas bagi pembaca layar.
- Form unit dipakai untuk tambah dan ubah (judul berganti "Ubah PS5 A"); nonaktif lewat dialog
  konfirmasi, penolakan server tampil di dialog. Hapus blok lewat dialog konfirmasi.
- Pilihan jam blok berupa select 30 menit dalam jam buka; tanggal dibatasi horizon server.

### Implementasi RPS-011 (pengaturan & reset)

- Dua baris panel: form identitas + pratinjau tersimpan (teks biasa, markup tidak dijalankan),
  lalu panel reset (garis merah muda, tombol danger) + aturan jadwal tetap (read-only).
- Reset memakai dialog "Kembalikan data contoh?" sesuai §9; setelah berhasil, notice sesi
  "Data demo dikembalikan ke contoh awal…" dan semua halaman di-mount ulang.
- Tab lain menampilkan notice "Data ruang demo sudah direset…" saat aktif kembali atau saat
  respons API membawa `X-Data-Version` yang lebih tinggi. Pemeriksaan sesi dibatasi satu request;
  respons dari sesi/versi lama tidak mengembalikan state yang sudah ditinggalkan. Landing juga
  memuat ulang katalog saat versi meningkat.
