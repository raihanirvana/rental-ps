import { formatWibDateTime } from '../lib/format.js';

// Pengingat tetap: ruang demo pribadi, data sementara, tanpa pembayaran di aplikasi.
export function DemoBar({ session }) {
  return (
    <div className="demo-bar">
      <p className="wrap">
        <span>
          <strong>Ruang demo pribadi</strong> · data contoh sementara
        </span>
        <span>Berlaku sampai {formatWibDateTime(session.workspace.expiresAt)}</span>
        <span>Pembayaran di tempat, tidak lewat aplikasi</span>
      </p>
    </div>
  );
}
