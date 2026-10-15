# Review RPS-010–RPS-011

Tanggal: 15 Oktober 2026. Hasil: **lolos review setelah perbaikan**.
Lingkup: API/UI unit, blok jadwal, pengaturan usaha dan reset workspace sendiri.
RPS-012/013 belum dikerjakan.

## Temuan dan perbaikan

| Temuan | Dampak / reproduksi | Perbaikan |
| --- | --- | --- |
| Pemeriksaan sesi lama menimpa sesi baru | Tahan GET session sesudah reset, logout, masuk sebagai pelanggan baru, lepas respons lama: UI kembali menganggap pengunjung pemilik lama | Abort saat sesi berganti, guard revision dan identitas sesi sebelum menerapkan respons |
| Pemeriksaan versi bisa saling memicu | GET session juga mengumumkan header versi; focus/visibility/request lain dapat memulai pemeriksaan ganda | GET session tidak mengumumkan versi; satu revalidasi berjalan; hanya versi lebih tinggi yang memicu pemeriksaan |
| Peran/logout tab lain diabaikan bila versi sama | Revalidasi hanya membandingkan dataVersion; role berubah atau 401 tidak memperbarui UI | Bandingkan identitas/peran sesi, adopsi sesi baru, tangani 401 dan abaikan request dari revision lama |
| Respons reset terlambat dapat mengubah workspace pengganti | Callback reset memakai sesi global saat respons tiba, meski halaman asal sudah ditinggalkan | Terapkan hasil hanya pada sesi asal/revision yang sama dan versi yang meningkat |
| Header reset masih memakai versi sebelum reset | Respons reset body v2 tetapi X-Data-Version 1; request yang menunggu lock juga bisa membawa versi lama | Header JSON mengikuti versi payload atau auth hasil pemeriksaan ulang dalam transaksi; rollback tetap membawa versi yang berlaku |
| Error refresh unit/blok dan aktivasi tidak terlihat | Mutasi berhasil tetapi GET daftar 503 tetap menampilkan data lama tanpa pesan; error aktifkan tersimpan di dialog tertutup | RefreshErrorNotice dengan retry dan error aktivasi di halaman; data terakhir tetap terbaca |
| Status memuat blok menyesatkan | Unit gagal dimuat sementara blok sudah ready, tetapi halaman terus berkata memuat blok | Form blok hanya dirender bila dependensi unit siap; error unit tetap bisa diulang |
| Jenis unit masih bisa diganti saat save berjalan | Nama/tarif disabled tetapi radio jenis tetap aktif | Fieldset jenis ikut disabled selama menyimpan |
| Katalog landing tidak berubah sesudah reset | Halaman protected memakai key versi, tetapi landing tetap memakai katalog lama | Key katalog landing menyertakan dataVersion, sehingga tarif/identitas ikut dimuat ulang |
| Teks valid panjang merusak layout | Nama/alamat/kontak tanpa spasi pada batas maksimal membuat halaman 360px melebar sampai 2626px | Pembungkusan teks dan kolom mobile minmax(0, 1fr); sesudah perbaikan lebar 360px tanpa elemen keluar |

Tidak menambahkan dependency atau unit test. Fungsi maksimal 25 baris termasuk JSX,
komentar dan blank line, dengan batas panjang baris 100 karakter.

## Verifikasi API yang dijalankan

Delapan belas kelompok lulus pada dua proses Express dengan satu SQLite dan port sementara.
Server kedua dinyalakan setelah migrasi proses pertama selesai. Database pengembangan
tidak disentuh.

1. Customer 403 pada pengelolaan unit/blok, PATCH settings dan reset; GET settings diizinkan.
2. Validasi unit ketat: nama, jenis, tarif string/pecahan/batas, boolean, field asing;
   nama NOCASE duplikat 409, patch kosong 400 dan unit workspace lain 404.
3. Perubahan nama/jenis/tarif tidak mengubah snapshot booking; booking belum berakhir
   mencegah unit dinonaktifkan.
4. Unit nonaktif tidak punya slot tersedia dan menolak booking; aktivasi ulang berhasil.
5. Blok bertumpuk/bersebelahan/sehari penuh, konflik booking, grid/horizon/jam/catatan,
   workspace asing, hapus dan slot tersedia kembali.
6. Unit ke-21 ditolak dan jumlah tetap 20.
7. Settings menolak field asing, tipe dan kontrol; markup disimpan sebagai teks.
8. Konfirmasi reset wajib. Trigger uji menggagalkan seed di tengah reset; seluruh snapshot
   workspace identik dengan sebelum percobaan.
9. Reset sukses: empat unit, 14 booking seed, dua blok, nol key; body/header v2; identitas workspace,
   sesi, peran dan expiry dipertahankan; workspace pengunjung kedua identik.
10. Delapan race reset/booking antarproses: booking tercatat dulu lalu dihapus reset, atau
    reset lebih dulu sehingga ID unit lama mendapat 404; tidak ada booking unit lama tersisa.
11. Delapan race booking/blok: selalu satu 201 dan satu 409 untuk interval sama.
12. Enam race booking/nonaktif: tidak pernah ada unit nonaktif dengan booking belum berakhir.
13. PATCH unit menunggu lock, lalu koneksi pemegang lock mereset dengan helper data/seed asli:
    PATCH mendapat 404 dengan header versi terbaru, bukan header sebelum menunggu.
14. Peran sesi diubah oleh koneksi pemegang lock: PATCH menunggu mendapat 403 tanpa ubah tarif.
15. Sesi expired tidak dapat mereset atau memperpanjang workspace.
16. Empat race reset/logout berakhir dengan workspace dan data terhapus.
17. Workspace dihapus saat reset menunggu lock: 401, tidak membuat workspace hidup kembali.
18. Integrity check ok dan foreign key check kosong.

Clock pada proses API sementara dipakai untuk expiry; jam mesin dan kode aplikasi tidak
diubah. Trigger kegagalan hanya dipasang/dihapus pada database uji dengan foreign key aktif.

## Verifikasi browser yang dijalankan

Chromium 153 headless melalui Playwright, build produksi, 13 kelompok lulus:

- Validasi tambah/ubah unit, isian invalid tetap, error nama duplikat dari server dan refresh daftar.
- Jenis disabled saat save ditahan; penolakan nonaktif, Escape/fokus; error aktivasi terlihat
  dan retry berhasil.
- Mutasi sukses dengan refresh unit gagal: pesan dan Coba lagi memulihkan hitungan daftar.
- Urutan jam blok invalid, overlap, isian tetap, refresh blok gagal/retry, batal/hapus konfirmasi.
- Error awal unit bisa diulang dan tidak mengklaim blok yang sudah dimuat masih loading;
  layout unit/blok 360/768/1280px tanpa overflow halaman.
- Validasi settings mempertahankan isian; markup di pratinjau tetap teks, bukan elemen;
  layout settings 360/768/1280px.
- Escape dan 503 saat reset tidak mengubah data; sukses mereset form dan mempertahankan TTL;
  tab lain memuat ulang unit saat focus.
- Beberapa event focus/visibility bersamaan hanya membuat satu GET session, tanpa loop header.
- Pergantian peran dari tab lain pada versi sama diikuti tab lama; logout eksternal langsung
  mengosongkan sesi saat focus.
- Respons reset yang ditahan sampai logout/masuk workspace baru tidak mengubah versi,
  notice atau draft form booking pelanggan pengganti.
- Teks tanpa spasi pada batas nama unit/usaha, alamat, kontak dan catatan blok tetap muat
  pada 360/768/1280px. Pemeriksaan khusus 360px juga menemukan nol elemen di luar viewport.
- Landing menampilkan tarif/identitas seed setelah workspace direset dari request lain.
- Nol page error; integrity dan foreign key bersih.

Uji khusus respons GET session lama dijalankan sebelum dan sesudah perbaikan: sebelum
perbaikan muncul "Halaman ini untuk pelanggan" karena sesi owner lama dipulihkan; sesudah
perbaikan halaman pelanggan baru dan draft tetap berlaku. Header reset berubah dari 1/2
(header/body) menjadi 2/2.

Regresi RPS-006/007 (10 kelompok) dan RPS-008/009 (10 kelompok) lulus, termasuk timeout
body streaming, idempotensi, quote berubah, konflik slot, expiry, paging/detail, pembatalan,
urutan refresh agenda, complete, keyboard dan layout. Mode dev Vite/StrictMode juga lulus:
skip link, login/ganti peran, agenda/dialog, unit, settings dan reset; nol page error.
Screenshot unit desktop dan pengaturan ponsel ditinjau.

## Batasan

- Hanya Chromium headless; Firefox, Safari dan pembaca layar sungguhan belum diuji.
- Error/penundaan UI diinjeksi lewat Playwright; transaksi, rollback dan race memakai API/SQLite asli.
- Tab lain tetap revalidasi saat focus/visibility atau request membawa versi lebih tinggi;
  tidak ada polling atau push. Tab yang belum menerima sinyal itu bisa menampilkan data lama.
- Saat refresh gagal, data terakhir tetap tampil dengan pesan belum diperbarui dan retry.
- Nama unik memakai SQLite NOCASE (ASCII), bukan normalisasi Unicode.
- Harness/screenshot/SQLite di direktori sementara, tidak masuk Git. Proses uji sendiri
  dihentikan; proses dev lain yang memakai port 5173 tidak dihentikan.
- `npm run check` (format, lint, build) lulus. Integrasi keamanan dan deployment tetap tiket berikutnya.
