# Aturan proyek Sesi Play

## Ruang lingkup

- Baca PRD dan tiket sebelum implementasi. Kerjakan satu tiket dari `docs/tickets/README.md`
  per tahap; jangan otomatis melanjutkan semua backlog.
- Model awal adalah booking unit PS di tempat, per jam. Jangan menambahkan sewa harian,
  pengantaran, payment gateway, atau fitur produksi lain tanpa perubahan PRD.
- Catat asumsi yang berubah dan perbarui dependensi/kriteria terkait.
- Gunakan skill frontend-design ketika membangun UI. Buat arah visual yang sesuai bisnis
  rental PS, sederhana dan matang; jangan menyalin desain portfolio personal atau POS.
- Baca `DESIGN.md` dan `docs/design/` untuk implementasi UI. Prototype adalah acuan visual;
  gunakan API/PRD sebagai sumber aturan bisnis, bukan fixture atau kalkulasi prototype.

## Kualitas kode

- JavaScript ESM; pisahkan route, service, repository, validasi, dan komponen UI.
- ESLint harus membatasi setiap fungsi maksimal **25 baris**, termasuk blank line,
  komentar, JSX, callback, arrow function, dan IIFE.
- Jangan memadatkan statement, memperpanjang baris untuk mengakali batas, atau mematikan
  aturan lint. Pecah menurut tanggung jawab. Panjang baris maksimal 100 karakter.
- Terapkan aksesibilitas dasar: label, focus terlihat, keyboard dan pesan error jelas.

## Verifikasi

- **Tidak membuat unit test**, sesuai preferensi pemilik. Gunakan lint, format, build,
  API smoke check dan browser sesuai perubahan.
- Untuk perubahan implementasi, jalankan lint dan build. RPS-001 menyiapkan `npm run check`.
- Uji transaksi/isolasi dengan database dan port sementara. Jangan menghapus database
  pengembangan atau menghentikan proses lain yang tidak dibuat untuk tiket tersebut.
- Catat hasil sebenarnya. Jangan mengklaim browser, race condition atau deploy yang belum diuji.
- Status tiket baru boleh Selesai setelah seluruh kriteria penerimaan terpenuhi.

## Booking dan data

- Server menentukan tarif, total, slot, waktu WIB, status dan hak akses. Client bukan
  sumber kebenaran. Jangan menerima workspaceId/peran/harga dari browser sebagai otoritas.
- Booking, pembatalan, perubahan unit dan blok jadwal memakai transaksi database dan
  pemeriksaan ulang sesi setelah kunci tulis diperoleh.
- Konflik interval memakai [mulai, selesai), bukan sekadar kesamaan jam mulai.
- Semua data demo dibatasi per workspace. Mengganti peran hanya berlaku pada workspace sendiri.
- Aplikasi ini tidak menerima uang. Jangan menyebut booking lunas atau nilai booking
  sebagai pendapatan yang benar-benar diterima.

## Repo dan hosting

- Jangan commit `.env`, token, dependency terpasang, SQLite, atau file runtime.
- Belum ada otorisasi membuat layanan berbayar. Target awal adalah demo gratis dengan
  data sementara; periksa batas platform saat deployment dikerjakan.
- Jangan mempublikasikan backend sebagai situs statis. Jangan menyebut demo live sebelum
  URL, API, cookie HTTPS dan alur booking benar-benar diperiksa.
