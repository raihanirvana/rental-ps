# Prototype visual Sesi Play

Tiga layar HTML/CSS/JS sebagai acuan implementasi Claude. Panduan utama: [DESIGN.md](../../DESIGN.md).
Status: proposal visual, bukan aplikasi booking yang selesai.

## Melihat tampilan

Dari root repo:

```bash
python3 -m http.server 4179 --bind 127.0.0.1 --directory docs/design
```

- `http://127.0.0.1:4179/` — landing.
- `http://127.0.0.1:4179/booking.html` — pilih unit/jam dan ringkasan.
- `http://127.0.0.1:4179/owner.html` — agenda pemilik.

Tanpa dependency tambahan dan tanpa backend. Semua aset lokal. Ctrl+C menghentikan preview.
Server ini hanya untuk referensi lokal, bukan deployment aplikasi.

## Interaksi yang disediakan

- Navigasi tiga layar dan anchor unit/cara booking.
- Pilih unit/durasi/jam; ringkasan perkiraan harga ikut berubah.
- Slot contoh terisi/diblokir/tutup punya alasan teks dan tidak bisa dipilih.
- Form nama/HP contoh, konfirmasi tanpa menyimpan, dialog Escape/fokus native.
- Agenda membuka detail contoh; tombol fitur yang belum dibangun memberi penjelasan.
- Perubahan tanggal agenda mengingatkan bahwa tampilan memakai satu tanggal ilustrasi.

Tidak ada cookie, localStorage, request API, pembayaran, sesi nyata atau persistensi.
Tanggal dan rentang waktu prototype tetap untuk acuan; PRD mengatur tanggal server aktual.
Warna dan layout adalah acuan, bukan bukti bahwa semua acceptance criteria tiket UI telah lulus.

## Aset dan lisensi

- Manrope Regular/Semibold/Bold: berasal dari aset lokal portfolio pemilik;
  lisensi disertakan di [OFL-Manrope.txt](fonts/OFL-Manrope.txt).
- Barlow Semi Condensed Semibold: [sumber Google Fonts](https://github.com/google/fonts/tree/main/ofl/barlowsemicondensed),
  lisensi disertakan di [OFL-BarlowSemiCondensed.txt](fonts/OFL-BarlowSemiCondensed.txt).
- Logo dan diagram SVG sederhana dibuat untuk demo. Bukan logo resmi Sony/PlayStation.
- Tidak memakai foto eksternal, gambar generatif atau font CDN runtime.

## Verifikasi

Diperiksa pada 15 Oktober 2026 dengan Chromium headless melalui Playwright yang sudah
tersedia di environment; tidak menambah dependency atau unit test proyek.

- Tiga layar pada lebar 360, 768, 1280 dan 1440px: tidak ada overflow halaman.
- Dua belas screenshot pembanding tersimpan di `screenshots/{index,booking,owner}-{width}.png`.
- PS4 via tautan unit: terpilih dengan perkiraan Rp30.000 untuk dua jam;
  ganti ke tiga jam menghasilkan Rp45.000.
- Lanjut isi data, form, dialog konfirmasi dan penutupan dengan Escape bekerja.
- Detail agenda dan penjelasan aturan status dapat dibuka.
- Reduced motion mematikan transisi tombol; tidak ditemukan error JavaScript/console
  selama pemeriksaan tersebut.
- `npm run check` (format, lint termasuk fungsi maksimal 25 baris, build React) lolos.
  Build ini memeriksa aplikasi yang ada; prototype tetap disajikan terpisah oleh static server.
- Source `App.jsx` tidak diganti; prototype tidak mengakses API atau data pengembangan.

Screenshot ditinjau untuk komposisi landing desktop/ponsel, booking dan agenda. Firefox,
Safari, screen reader sungguhan serta integrasi API belum diverifikasi pada prototype ini.
Ini verifikasi desain, bukan bukti acceptance criteria booking/keamanan aplikasi telah selesai.

Screenshot utama:

- [Landing desktop](screenshots/index-1440.png)
- [Booking desktop](screenshots/booking-1440.png)
- [Agenda desktop](screenshots/owner-1440.png)
- [Landing ponsel](screenshots/index-360.png)
- [Booking ponsel](screenshots/booking-360.png)
- [Agenda ponsel](screenshots/owner-360.png)
