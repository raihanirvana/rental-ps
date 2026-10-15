import { formatDateKey, formatDuration, formatTimeRange } from '../../lib/booking-format.js';
import { formatRupiah } from '../../lib/format.js';
import { ControllerIcon } from '../icons.jsx';

function SummaryDetails({ flow }) {
  const { choice, slot, unit } = flow;
  return (
    <dl className="detail-list">
      <dt>Tanggal</dt>
      <dd>{flow.dateValid ? formatDateKey(choice.date) : '—'}</dd>
      <dt>Jam</dt>
      <dd>{slot ? formatTimeRange(slot.startTime, slot.endTime) : 'Belum dipilih'}</dd>
      <dt>Durasi</dt>
      <dd>{formatDuration(choice.durationMinutes)}</dd>
      <dt>Tarif</dt>
      <dd>{unit ? `${formatRupiah(unit.hourlyRate)} / jam` : '—'}</dd>
    </dl>
  );
}

// Perkiraan dari quote server pada hasil availability terbaru; total final dari booking.
function SummaryTotal({ availability }) {
  const quote = availability.status === 'ready' ? availability.data.quote.total : null;
  return (
    <div className="summary-total">
      <span>Perkiraan biaya</span>
      <strong className="price">{quote === null ? '—' : formatRupiah(quote)}</strong>
    </div>
  );
}

function SummaryAction({ flow, onContinue }) {
  if (flow.step !== 'schedule') {
    return <p className="summary-note">Lengkapi data diri di bawah jadwal.</p>;
  }
  return (
    <button
      type="button"
      className="button button--wide"
      disabled={!flow.slot}
      onClick={onContinue}
    >
      {flow.slot ? 'Lanjut isi data' : 'Pilih jam dulu'}
    </button>
  );
}

export function BookingSummary({ flow, onContinue }) {
  return (
    <aside className="summary" aria-labelledby="summary-title">
      <div className="summary-title">
        <ControllerIcon />
        <div>
          <span className="display-type">{flow.unit?.name ?? 'Pilih unit'}</span>
          <small>TV dan dua kontroler</small>
        </div>
      </div>
      <div className="summary-body">
        <h2 id="summary-title">Rencana mainmu</h2>
        <SummaryDetails flow={flow} />
        <SummaryTotal availability={flow.availability} />
        <SummaryAction flow={flow} onContinue={onContinue} />
        <p className="summary-note">Bayar di tempat. Tanpa pembayaran online.</p>
      </div>
    </aside>
  );
}
