import { roleHome } from '../../lib/routes.js';

// Penjelasan bisnis contoh dan batas data demo; tidak ada alamat yang seolah bisa didatangi.
export function LandingFooter({ businessName, demo }) {
  return (
    <footer className="site-footer">
      <div>
        <p>
          {businessName} adalah contoh website rental PS. Nama, fasilitas dan tarif merupakan
          ilustrasi, tidak berafiliasi dengan Sony/PlayStation.
        </p>
        <p>
          Setiap pengunjung mendapat ruang demo sendiri selama 12 jam. Data bersifat sementara dan
          dapat hilang saat server dimulai ulang. Aplikasi tidak memproses pembayaran.
        </p>
      </div>
      <button
        type="button"
        className="text-link"
        onClick={() => demo.start('owner', roleHome.owner)}
        disabled={demo.pendingRole !== null}
      >
        Lihat sisi pemilik
      </button>
    </footer>
  );
}
