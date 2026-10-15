# Review RPS-008–RPS-009

Tanggal: 15 Oktober 2026. Hasil: **lolos review setelah perbaikan**.
Lingkup: booking saya, detail/pembatalan, API agenda pemilik dan penyelesaian sesi.
Pengelolaan unit/blok dan pengaturan belum dikerjakan (RPS-010/011).

## Temuan dan perbaikan

| Temuan | Reproduksi / dampak | Perbaikan |
| --- | --- | --- |
| Refresh detail lama menimpa booking lain | Tolak cancel A, tahan GET refresh A, kembali lewat history ke detail B, lepas respons A: URL B menampilkan nomor A | `useRefreshableResource` membatalkan request lama dan memeriksa urutan request; hasil mutasi hanya mengganti resource yang masih aktif |
| Refresh agenda lama bisa mengembalikan status/ringkasan lama | Batalkan dua booking berurutan sambil menahan hasil refresh pertama; snapshot pertama datang terakhir | Muat awal, refresh dan update mutasi berbagi urutan; update membatalkan refresh sebelumnya |
| Refresh gagal disembunyikan | GET setelah cancel ditolak/gagal dengan 503; detail atau ringkasan lama tetap terlihat tanpa penjelasan | Pesan refresh gagal dan Coba lagi; data tetap bisa dibaca, dialog agenda juga menampilkan error refresh |
| Baris hasil mutasi tidak mengikuti filter status | Batalkan booking saat filter confirmed; sebelum refresh selesai, baris cancelled masih di filter confirmed | Hasil mutasi langsung menerapkan filter status sebelum server menyegarkan ringkasan |
| State dialog bisa terbawa ke filter agenda lain | Tahan respons cancel, browser Back ke tanggal lain, buka detail blok, lepas respons lama | State dialog berada pada konten agenda aktif dan di-mount ulang per key filter; respons mutasi lama tidak mengubah dialog baru |
| Baris baru pada alasan lolos browser | Isi textarea dengan dua baris; browser menerima, server menolak karakter kontrol | Validasi client memeriksa nilai mentah, sama dengan server; tidak mengirim request invalid |
| Tab keluar dari dialog dengan satu tombol | Buka detail sesi completed, lalu Tab dari Tutup; fokus meninggalkan dialog | Putaran Tab/Shift+Tab eksplisit, termasuk ketika seluruh kontrol disabled; fokus kembali ke pemicu yang masih terlihat atau main |

Tidak menambahkan dependency atau unit test. Semua fungsi tetap maksimal 25 baris,
termasuk JSX, komentar dan blank line; lint juga memeriksa batas 100 karakter per baris.

## Verifikasi API

Harness di scratchpad memakai dua proses Express, SQLite dan port sementara. Waktu server
dibekukan pada 15 Oktober 2026 pukul 12.00 WIB untuk pemeriksaan batas waktu yang terulang.
Database pengembangan tidak disentuh. Tiga belas kelompok pemeriksaan lulus:

1. Tanpa sesi mendapat 401; customer mendapat 403 pada agenda/complete, termasuk header/query
   peran palsu.
2. Seed tidak masuk booking saya; 13 booking pengunjung terbagi 10+3 tanpa duplikasi.
3. Detail, cancel, unit agenda dan complete dari workspace lain mendapat 404.
4. Mengubah nama/tarif unit tidak mengubah snapshot detail booking lama.
5. Cancel menolak karakter kontrol, menyimpan alasan sah, memindahkan tab dan membuka slot.
6. Agenda WIB membawa penanda seed/blok; hitungan ongoing, jumlah, durasi dan nilai sesuai SQL.
7. Filter tanggal/unit/status, hari kosong dan ringkasan cancelled sesuai kontrak.
8. Filter invalid/ganda/tidak dikenal serta body status yang salah mendapat 400.
9. Complete ongoing ditolak; ended berhasil sekali; replay mempertahankan completedAt;
   cancel pada completed ditolak.
10. Dua belas race complete/cancel antarproses: setiap ronde satu 200 dan satu 409;
    status terminal dan timestamp tetap konsisten.
11. Complete yang menunggu write lock mengecek ulang peran: peran sesi diubah menjadi
    customer lewat koneksi SQLite pemegang lock, hasil 403 tanpa perubahan booking.
12. Tepat waktu mulai termasuk ongoing; tepat waktu akhir sudah ended, ongoing nol dan
    complete diizinkan.
13. `PRAGMA integrity_check` menghasilkan ok dan `foreign_key_check` kosong.

Tanggal agenda yang **tidak dikirim** memakai hari WIB server; `date=` kosong ditolak 400.
Ringkasan mengikuti filter, mengabaikan cancelled dan memakai nilai snapshot reservasi,
bukan pembayaran atau pendapatan diterima.

## Verifikasi browser

Chromium 153 headless melalui Playwright, build produksi, sepuluh kelompok lulus:

- Daftar kosong tanpa seed, 13 booking, paging 10+3, respons halaman ditahan, refresh URL.
  Tidak ada baris atau label halaman lama selama halaman baru dimuat.
- Error daftar 503 lalu retry; snapshot setelah unit berubah dan URL detail di tab baru.
- Dialog batal: Tab, Escape, fokus kembali, newline ditolak tanpa request; alasan sah
  tersimpan dan status detail berubah.
- Daftar/detail pada 360/768/1280px tanpa overflow halaman; seed, workspace asing, ID hilang
  dan URL encoding rusak ditangani.
- Refresh detail 503 setelah cancel ditolak menampilkan pesan dan retry yang berhasil.
- Dua cancel agenda dengan refresh pertama ditahan: respons lama tidak mengembalikan
  booking aktif atau ringkasan lama.
- Refresh agenda gagal: error terlihat, baris cancelled keluar dari confirmed, retry
  memperbarui ringkasan server.
- Back ketika cancel masih memproses lalu membuka blok tanggal lain: respons lama tidak
  mengubah pesan/busy dialog baru; Tab/Shift+Tab juga tetap di dialog saat kontrol disabled.
- Complete sesi ended melalui UI, hari kosong dan filter setelah refresh; keyboard,
  Tab/Shift+Tab dan pemulihan fokus agenda pada 360/768/1280px tanpa overflow halaman.
- Guard halaman owner untuk customer, SQLite utuh dan nol page error.

Reproduksi khusus detail A → B diulang sesudah perbaikan: URL dan nomor tetap B setelah
respons A dilepas. Screenshot agenda desktop dan daftar ponsel ditinjau terhadap DESIGN.md.

Regresi sepuluh kelompok RPS-006/007 juga lulus: landing anonim, sesi lama, guard login,
respons JSON rusak, perubahan quote, konflik slot, respons availability lama, ganti peran,
dialog logout, reduced motion, timeout body streaming dan expiry sesudah ganti peran.
Judul owner pada harness lama disesuaikan ke halaman agenda yang kini sudah dibuat.

Mode dev Vite/StrictMode juga lulus: Tab pertama ke skip link, login/ganti peran melalui
proxy, agenda termuat sesudah refresh, serta buka/Tab/Escape dialog tanpa page error.

## Batasan

- Hanya Chromium headless; Firefox, Safari dan pembaca layar sungguhan belum diuji.
- Sesi ended/ongoing dibuat lewat fixture SQLite karena API menolak booking masa lalu.
  Clock uji hanya di proses server sementara, bukan jam mesin atau kode aplikasi.
- Respons lambat/503/409 pada UI diinjeksi lewat Playwright; aturan server dan race transaksi
  diuji terpisah dengan API/database sungguhan.
- Bila refresh gagal, data/ringkasan terakhir tetap tampil dengan pesan belum diperbarui;
  Coba lagi memuat keadaan server. Tidak ada polling waktu nyata.
- Harness, screenshot dan SQLite berada di direktori sementara, tidak masuk Git.
- `npm run check` (format, lint, build) lulus. Belum deployment publik.
