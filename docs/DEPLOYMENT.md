# Deployment dan presentasi Sesi Play

Target: satu **Render Free Web Service**, region Singapore, repo
`raihanirvana/rental-ps`, branch `master`. React dan API memakai origin yang sama;
tidak perlu Vercel, database terpisah, CORS atau domain berbayar.

## Konfigurasi

`render.yaml` adalah acuan konfigurasi. Script CLI membuat service dengan nilai yang sama.
Pembuatan melalui CLI tidak otomatis menghubungkannya sebagai Blueprint.

| Pengaturan | Nilai |
| --- | --- |
| Runtime | Node 22.20.0, mendukung `node:sqlite` tanpa flag |
| Build | `npm ci --include=dev && npm run check` |
| Start | `npm start`; migrasi SQLite berjalan otomatis |
| Health check | `/api/health` |
| Bind | `HOST=0.0.0.0`; `PORT` memakai nilai yang disediakan Render |
| Environment | `NODE_ENV=production`, `TRUST_PROXY=1` |
| Database | `DATABASE_PATH=./data/sesi-play.sqlite`, filesystem sementara |
| Kapasitas | Satu instance Free; tanpa persistent disk |
| Auto deploy | Off; deploy manual supaya push dokumentasi tidak menghapus demo |

`TRUST_PROXY=1` mempercayai hop reverse proxy Render untuk HTTPS/cookie Secure.
Jangan menyalin nilai ini ke server yang dapat diakses langsung tanpa reverse proxy.
`ALLOWED_ORIGINS` tetap kosong karena frontend/API berada pada origin yang sama.
TTL dan batas API memakai default `.env.example`. Aplikasi tidak memerlukan secret
statis; token sesi acak disimpan sebagai hash di SQLite. Kredensial Render hanya di
penyimpanan lokal CLI/environment, tidak di repo, perintah Git atau dokumentasi.

## Deploy pertama dan redeploy

Pasang [Render CLI](https://render.com/docs/cli), lalu dari root repo:

```bash
bash scripts/deploy-render.sh --login  # hanya bila belum login / otorisasi berakhir
npm ci
npm run check
npm run verify:api
git push origin master
bash scripts/deploy-render.sh --create # sekali saja, paket Free secara eksplisit
```

Pastikan workspace aktif benar (`render workspaces`, `render workspace set`). Script
mencocokkan repo dan branch, menolak service non-Free, serta mencegah create duplikat.
Jika proses create terputus, periksa `render services --output json` sebelum mengulang.
Jangan mengganti nama/repo/plan service POS atau service lain.

Untuk pembaruan kode, push terlebih dahulu lalu:

```bash
bash scripts/deploy-render.sh
# Bila ada beberapa service dari repo ini, tentukan service milik rental-ps:
RENDER_SERVICE_ID=srv_ID_RENTAL_PS bash scripts/deploy-render.sh
```

Perintah menunggu deployment selesai dan gagal bila Render melaporkan kegagalan.
Lihat build/app logs di dashboard bila gagal. Jangan mengatasi batas Free dengan upgrade
otomatis. Alternatif UI: New Web Service → repo rental-ps → salin konfigurasi di atas → Free.

## Batas hosting gratis

Berdasarkan [dokumentasi Render Free](https://render.com/docs/free), diperiksa 15 Oktober 2026:

- Service tidur setelah 15 menit tanpa traffic; membuka kembali dapat memerlukan sekitar satu menit.
- SQLite hilang saat sleep, restart atau redeploy; Free tidak mendukung persistent disk.
- Kuota **750 jam instance per workspace per bulan**, dibagi seluruh Free Web Service,
  termasuk POS dan service lain. Jam habis dapat menghentikan semuanya sampai bulan berikutnya.
- Bandwidth dan build juga berkuota. Periksa Billing → Monthly Included Usage sebelum presentasi.
  Akun dengan metode pembayaran bisa dikenai biaya kelebihan bandwidth/build; tanpa metode
  pembayaran, layanan/build dapat dihentikan. Jangan memasang pembayaran atau menaikkan limit
  untuk demo ini. Script hanya membuat compute Free, bukan mengubah pengaturan billing akun.

CLI menampilkan paket service tetapi tidak menampilkan sisa kuota bulanan/billing workspace.
Jangan menganggap service Free berarti kuota tak terbatas. Buka demo sesaat sebelum
presentasi; hindari bot keep-alive yang menghabiskan jatah bersama.

## Pemulihan data demo

Booking bukan transaksi pembayaran; gunakan nama dan nomor contoh. Umur ruang demo maksimal
12 jam, dan bisa lebih pendek jika hosting kehilangan SQLite. Setelah itu buka halaman lagi,
pilih **Mulai demo** untuk mendapatkan ruang baru. Data lama tidak dapat dipulihkan.
Jika server sedang bangun, tunggu halaman Render selesai lalu muat ulang sekali; tombol
**Coba lagi** tersedia untuk kegagalan jaringan. Jangan terus mengirim booking ketika loading.

## Alur presentasi (3–5 menit)

1. Buka landing, jelaskan main di tempat, tarif contoh dan pembayaran di lokasi.
2. **Coba booking** → PS5 A → besok (WIB) → 19.00 → 1 jam → nama contoh → konfirmasi.
   Tunjukkan kode, tarif snapshot dan status di **Booking saya**.
3. Pilih **Coba sebagai pemilik**, buka tanggal besok di **Agenda**. Booking tadi tetap ada
   di ruang yang sama. Pemilik dapat mengatur unit/blok dan identitas usaha.
4. Kembali sebagai pelanggan dan pilih slot tadi: statusnya terisi. Tab pelanggan yang sudah
   memilih slot sebelum booking dibuat juga ditolak server ketika konfirmasi (konflik 409).
   Untuk simulasi konflik tab, buka dua tab setelah sesi pelanggan aktif; jangan ganti peran
   di tengah simulasi karena ganti peran mencabut token sesi lama.
5. Buka incognito: ruang baru berisi data contoh sendiri; booking pengunjung pertama tidak muncul.
6. Di ruang pertama, sebagai pemilik buka **Pengaturan** → **Reset data demo** → konfirmasi.
   Data kembali ke contoh awal; ruang incognito tetap utuh. Reset juga bisa dibatalkan.

URL publik dan bukti hasil deployment dicatat setelah verifikasi di tiket RPS-013.
