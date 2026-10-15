import { formatMinutes } from '../../lib/agenda-view.js';
import { formatRupiah } from '../../lib/format.js';

// Definisi ringkasan: booking yang tampil menurut filter tanggal/unit/status, tanpa
// booking dibatalkan. Sedang main dihitung server dari waktu mulai/selesai.
export function AgendaSummary({ summary }) {
  return (
    <div className="agenda-summary">
      <p className="summary-line" aria-label="Ringkasan agenda">
        <span>
          <strong>{summary.bookingCount}</strong> booking
        </span>
        <span>
          <strong>{summary.ongoingCount}</strong> sedang main
        </span>
        <span>
          <strong>{formatMinutes(summary.scheduledMinutes)}</strong> terjadwal
        </span>
      </p>
      <p className="agenda-note">
        <strong>{`Nilai reservasi: ${formatRupiah(summary.reservationValue)}.`}</strong> Bukan
        pendapatan diterima; aplikasi tidak mencatat pembayaran. Ringkasan mengikuti filter dan
        tidak menghitung booking dibatalkan.
      </p>
    </div>
  );
}
