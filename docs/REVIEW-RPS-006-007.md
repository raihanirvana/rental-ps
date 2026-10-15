# Review RPS-006–RPS-007

Tanggal: 15 Oktober 2026. Hasil: **lolos review setelah perbaikan**.
Lingkup: landing, sesi/router/shell dan alur pelanggan dari pilih jadwal hingga konfirmasi.
Halaman booking saya, agenda lengkap, pengelolaan unit dan pengaturan tetap tiket berikutnya.

## Temuan dan perbaikan

| Temuan | Reproduksi / dampak | Perbaikan |
| --- | --- | --- |
| Cek sesi awal terlambat menimpa login | GET session 401 ditahan, CTA login berhasil, lalu respons lama dilepas: UI kembali meminta masuk meski cookie baru valid | Request sesi memakai revision dan AbortController; notifikasi 401 request lama tidak mengubah sesi pengganti |
| Mutasi sesi tumpang tindih / pemulihan gagal | Klik CTA berturut-turut dapat mengirim lebih dari satu POST; abort cek awal lalu login gagal dapat meninggalkan state loading | Guard mutasi bersama semua CTA/header; cek sesi ulang setelah mutasi gagal; katalog per-session membuang respons lama |
| JSON sukses rusak atau body terhenti dianggap hasil null | Server sudah menyimpan, body 200 dipotong: konfirmasi mengakses result.booking dan halaman crash | Payload tidak terbaca menjadi INVALID_RESPONSE; AbortError tetap dilempar agar timeout 15 detik tampil sebagai error yang bisa diulang dengan key sama |
| Harga berubah diterima tanpa tinjauan ulang | Ringkasan Rp50.000, tarif DB menjadi Rp40.000/jam, klik konfirmasi langsung mencatat Rp80.000 | Quote ID dari availability dibandingkan ulang di transaksi; mismatch 409 QUOTE_CHANGED tanpa booking/key; UI memuat harga terbaru dan meminta pilih/konfirmasi ulang |
| Tarif ringkasan berbeda dari total terbaru | Tarif per jam memakai katalog lama, total memakai quote baru | Unit/tarif pilihan memakai unit pada hasil availability terbaru |
| Katalog publik dipakai pada halaman booking | Logout tab lain terjadi sesudah cek sesi tetapi sebelum katalog; ID publik null membuat alur tidak bisa melanjutkan | useWorkspaceCatalog memuat ulang sesi bila respons berubah menjadi publik, lalu menampilkan layar masuk |
| Kontrol pada input dinormalisasi sebelum validasi | Tab pada nama/nomor dapat terbuang sebelum server melihatnya | Validasi browser memeriksa nilai mentah sebelum trim/normalisasi |
| Fokus awal di dev StrictMode | Effect awal dijalankan ulang sehingga flag firstRender memfokuskan main saat muat awal | Membandingkan pathname sebelumnya; Tab pertama tetap ke skip link |

Tidak menambahkan unit test atau dependency. Fungsi tetap maksimal 25 baris setelah format.

## Kontrak quote

Availability menambah `quote.id`, string SHA-256 dari workspace, identitas/nama/jenis unit,
tarif dan durasi. Ini identitas snapshot harga, **bukan token otorisasi atau penahanan slot**.
Server tetap menentukan seluruh harga dan memeriksa jadwal.

Frontend mengirim `quoteId` itu pada POST booking. Sesudah mendapatkan write lock dan
memeriksa sesi, idempotensi serta slot, server membandingkan quote dengan data unit terbaru.
Mismatch menghasilkan 409 QUOTE_CHANGED dan rollback sebelum insert booking/key.

`quoteId` opsional hanya untuk kompatibilitas kontrak API lama; frontend baru selalu mengirim.
Harga/total mentah dari client tetap ditolak. Hash request lama tanpa quoteId dipertahankan
persis; bila quoteId disertakan, ia menjadi bagian hash/fingerprint. Retry harus mempertahankan
key dan payload termasuk quoteId. Replay booking yang sudah tercatat mendahului pemeriksaan
quote terkini agar timeout setelah berhasil tidak membuat booking baru atau mengubah snapshot.

## Verifikasi yang benar-benar dijalankan

Build produksi dan Vite diuji dengan Chromium headless melalui Playwright yang sudah
tersedia di environment. Server/SQLite memakai direktori dan port sementara. Seluruh proses
uji milik review dihentikan sendiri; database pengembangan tidak disentuh.

Sepuluh kelompok browser produksi utama lulus:

1. Landing anonim memuat katalog tanpa POST/workspace/cookie; layout 360/768/1280px.
2. GET session 401 lama tidak menimpa login baru.
3. Tiga klik CTA dalam satu tick hanya membuat satu workspace.
4. Respons 200 dipotong setelah server menyimpan: error terbaca, retry dengan key sama,
   satu booking, tanpa page error.
5. Harga berubah: 409, nol booking untuk percobaan pertama, tarif/total baru ditampilkan,
   nama dipertahankan, konfirmasi kedua menyimpan total Rp80.000.
6. Slot direbut request lain: 409, jadwal diperbarui, pilihan dilepas, nama/HP dipertahankan.
7. Availability lama diabaikan setelah tanggal berubah; kontrol input ditolak browser;
   layout booking pada 360/768/1280px tanpa scroll horizontal halaman.
8. Ganti peran, dialog logout, Tab di dialog, Escape/restore focus dan reduced motion.
9. Proxy HTTP sungguhan mengirim header serta sebagian body booking lalu menahannya:
   timeout 15 detik menjadi error, tidak retry otomatis; retry key sama mengembalikan
   satu booking yang memang sudah disimpan.
10. Timer expiry tetap bekerja setelah role switch dengan akhir workspace yang sama.

Pemeriksaan tambahan lulus:

- Login gagal saat cek sesi awal masih berjalan pulih ke layar masuk, bukan loading tanpa akhir.
- Dua proses pada SQLite sama: booking menunggu write lock, proses lain mengubah tarif,
  kemudian lock dilepas → QUOTE_CHANGED tanpa insert booking/key.
- Replay dengan quote lama setelah booking berhasil dan tarif berubah tetap mengembalikan
  snapshot asli. API tanpa quoteId tetap replay dengan hash request kontrak sebelumnya.
- Logout di antara cek sesi dan katalog kembali ke layar masuk, tanpa loop ID null.
- Respons booking lama yang ditahan saat role switch tidak tampil setelah berpindah peran;
  logout sukses menghapus workspace/cookie.
- Availability 503 dapat dipulihkan melalui Coba lagi.
- HTTP 503 saat logout mempertahankan dialog dan pesan error; ganti peran yang gagal
  juga tetap menampilkan error tanpa membuang sesi yang masih valid.
- Mode dev Vite/StrictMode: skip link menjadi fokus Tab pertama, login/ganti peran/refresh
  melalui proxy berhasil dan tidak ada page error.
- `npm run check`: format, lint, build lolos.

Screenshot landing desktop dan booking ponsel ditinjau terhadap DESIGN.md. Screenshot
serta harness berada di direktori sementara, tidak menambah artefak runtime ke Git.

## Batasan

- Hanya Chromium headless; Firefox, Safari dan pembaca layar sungguhan belum diuji.
- Uji expiry memakai TTL yang dipersingkat pada database sementara, bukan mengubah jam mesin.
- Tidak ada pembayaran nyata; nilai reservasi tetap snapshot dan Bayar di tempat.
- Quote bukan hold. Booking masih dapat kalah berebut slot sesudah harga ditinjau.
- API legacy tanpa quoteId mengikuti tarif server saat commit; perlindungan persetujuan
  harga baru berlaku ketika quoteId disertakan, seperti yang dilakukan frontend baru.
- Origin/rate limit/kapasitas tetap RPS-012. Belum deployment publik.
