# Review RPS-004–RPS-005

Tanggal: 15 Oktober 2026. Hasil: **lolos review setelah perbaikan**. API katalog,
ketersediaan, booking, daftar/detail dan pembatalan siap dipakai tahap frontend.
Belum mencakup implementasi landing/UI, pengelolaan unit/blok atau deployment.

## Temuan yang diperbaiki

| Temuan | Bukti / dampak | Perbaikan |
| --- | --- | --- |
| `__proto__` lolos allowlist | POST booking dan GET availability/mine menerima field asing ini; assignment pada object biasa tidak menghasilkan own property | Error bag field asing memakai object tanpa prototype; field tetap terdeteksi dan respons 400 memuat namanya |
| Karakter kontrol dibuang sebelum validasi | Nama `\\nRaka\\t` dan HP dengan newline sempat diterima; alasan newline bisa menjadi tanpa alasan | Validasi karakter kontrol pada nilai mentah sebelum trim/normalisasi, termasuk alasan yang seluruhnya kontrol |
| Pembatalan berbody non-JSON tetap dijalankan | Body text/plain diabaikan parser, lalu dianggap body kosong sehingga booking dibatalkan | Body yang dikirim wajib application/json; non-JSON ditolak 400 tanpa perubahan. Body yang benar-benar kosong tetap boleh |
| Pembacaan workspace memakai auth dari luar snapshot | Logout/rotasi di proses lain dapat membuat auth usang; katalog dapat kehilangan row pengaturan dan menjadi error 500 | Helper withWorkspaceReadAccess mengecek sesi serta membaca katalog/slot/mine/detail dalam snapshot yang sama |

Tidak mengubah kontrak key/hash, kalkulasi tarif, schema atau migrasi. Pengecekan ulang
mutasi setelah BEGIN IMMEDIATE tetap dipertahankan. Data booking berasal dari server.

## Verifikasi

Tanpa unit test. Script integrasi/harness berada di direktori sementara di luar repo,
memakai database baru dan port ephemeral. Semua proses server yang dibuat dihentikan
melalui referensi child process sendiri; tidak menyentuh database pengembangan.

`npm run check` lolos: format, ESLint (25 baris per fungsi termasuk blank line/JSX), build.

Enam belas kelompok pemeriksaan integrasi utama lulus:

1. Katalog anonim read-only, tanpa cookie atau pembuatan workspace.
2. Quote PS5 A Rp50.000 untuk dua jam WIB; replay key melalui proses server lain dan
   konflik saat payload berbeda.
3. Overlap sebagian ditolak; slot bersebelahan serta unit berbeda diterima; availability
   sesuai hasil POST booking.
4. Validasi tanggal/grid/horizon/tipe, karakter kontrol dan allowlist `__proto__`; D+14 diterima.
5. Unit/detail/pembatalan lintas workspace 404; seed tersembunyi dari customer.
6. Tiga view mine, total, limit/offset serta batas maksimum paginasi.
7. Validasi JSON/alasan cancel, pembatalan berulang tidak mengubah timestamp, key booking
   cancelled tetap replay status cancelled dan slot kembali tersedia.
8. Tarif unit baru memperbarui quote; detail lama mempertahankan nama/harga snapshot.
9. Dua proses Node pada file SQLite sama: delapan request key berbeda di slot sama
   menghasilkan **satu 201 dan tujuh 409**. Enam request key/payload sama menghasilkan
   **satu 201 dan lima 200**, semuanya ID booking sama.
10. Trigger sementara menggagalkan insert booking_requests: booking dan key rollback,
    lalu retry persis dengan key sama berhasil setelah trigger dihapus. Error 500 pada
    kegagalan yang sengaja diinjeksi ini diharapkan; tidak ada stack trace pada respons.
11. Koneksi lain menahan write lock: 503 DATABASE_BUSY dengan Retry-After: 1, tanpa booking parsial.
12. Auth yang dicabut sesudah pembacaan awal ditolak ulang oleh keempat service baca;
    owner tetap bisa melihat seed workspace sendiri.
13. Setelah logout melalui server kedua, service katalog dengan auth usang mendapat 401,
    bukan error pengaturan yang hilang.
14. Request booking menunggu write lock; penulis lain mencabut sesinya sebelum lock dilepas:
    request mendapat 401 dan tidak menyimpan key/booking. Harness memberi sinyal saat
    BEGIN IMMEDIATE akan dipanggil agar urutan interleaving dapat diuji.
15. Server HTTP dengan jam terkontrol di harness: tepat 15 menit diterima; kurang 1ms
    ditolak availability/POST. Replay setelah waktu mulai tetap booking sama. Customer
    tidak dapat membatalkan setelah mulai; owner dapat membatalkan confirmed berlangsung.
16. Database akhir tanpa overlap booking non-cancelled, integrity_check ok dan
    foreign_key_check kosong.

Pemeriksaan fixture tambahan lewat HTTP mencakup blok maintenance/adjacency, semua slot
unit nonaktif dan POST-nya, durasi 60/180 menit hingga batas tutup, normalisasi nomor
`+62 812-3456-7890`, cancel tanpa body dan penolakan pembatalan completed. Blok serta
unit nonaktif disiapkan langsung pada database uji karena API pengelolaannya belum ada.

## Batas review

- Seluruh interaksi tahap ini API/SQLite. Tidak mengklaim UI booking atau browser telah diuji.
- Pengujian waktu 15 menit memakai clock terkontrol di harness, bukan mengubah jam mesin
  atau menambah fitur jam simulasi ke aplikasi.
- Public catalog tetap boleh menjadi contoh anonim jika sesi sudah invalid saat loadSession.
  Bila sesi berubah sesudahnya, pembacaan workspace boleh mengembalikan 401 agar client memuat ulang sesi.
- Origin check, rate limit dan kapasitas tetap RPS-012. Tidak ada klaim siap produksi.
- Pagination masih limit/offset, dapat bergeser bila data berubah antarpembacaan halaman.
- Berikutnya RPS-006, mengikuti DESIGN.md. Review ini tidak mengimplementasikan tiket tersebut.
