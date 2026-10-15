import { ErrorNotice, Notice } from '../Notice.jsx';
import { SlotGrid, SlotLegend } from './SlotGrid.jsx';

function SlotBody({ flow, onPick }) {
  const { availability, dateValid, choice } = flow;
  if (!dateValid) {
    return <p className="slot-state">Pilih tanggal yang valid untuk melihat jam.</p>;
  }
  if (availability.status === 'error') {
    const error = { message: `Jam tersedia belum bisa dimuat. ${availability.error.message}` };
    return <ErrorNotice error={error} onRetry={availability.reload} />;
  }
  if (availability.status !== 'ready') {
    return <p className="slot-state">Memuat jam tersedia…</p>;
  }
  const { slots } = availability.data;
  if (!slots.some((slot) => slot.available)) {
    return (
      <p className="slot-state">
        Belum ada jam kosong untuk durasi ini. Ubah tanggal, durasi atau unit.
      </p>
    );
  }
  return <SlotGrid slots={slots} selected={choice.startTime} onPick={onPick} />;
}

function availabilityStatus({ availability, dateValid }) {
  if (!dateValid || availability.status !== 'ready') {
    return availability.status === 'loading' ? 'Memuat jam tersedia…' : '';
  }
  const count = availability.data.slots.filter((slot) => slot.available).length;
  return `${count} jam mulai tersedia.`;
}

export function SlotSection({ flow, onPick }) {
  const loading = flow.dateValid && flow.availability.status === 'loading';
  return (
    <section aria-labelledby="slot-title" aria-busy={loading}>
      <div className="slot-heading">
        <h2 id="slot-title">Pilih jam mulai</h2>
        <small>Semua waktu dalam WIB</small>
      </div>
      <SlotLegend />
      {flow.schedule.message ? <Notice tone="error">{flow.schedule.message}</Notice> : null}
      <SlotBody flow={flow} onPick={onPick} />
      <p className="visually-hidden" role="status">
        {availabilityStatus(flow)}
      </p>
      <p className="inline-note">Jam belum ditahan. Ketersediaan diperiksa lagi saat konfirmasi.</p>
    </section>
  );
}
