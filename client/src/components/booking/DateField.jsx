import { formatDateKey } from '../../lib/booking-format.js';

// Batas tanggal dari server (hari ini sampai D+14 WIB), bukan dari jam perangkat.
export function DateField({ value, range, valid, onChange }) {
  const hint = `Bisa dipesan ${formatDateKey(range.from)} sampai ${formatDateKey(range.to)}.`;
  return (
    <div>
      <label className="field-label" htmlFor="booking-date">
        Tanggal main
      </label>
      <input
        className="input"
        id="booking-date"
        type="date"
        value={value}
        min={range.from}
        max={range.to}
        required
        aria-invalid={!valid}
        aria-describedby="booking-date-hint"
        onChange={(event) => onChange(event.target.value)}
      />
      <small id="booking-date-hint" className={valid ? 'field-hint' : 'field-error'}>
        {valid ? hint : `Pilih tanggal yang valid. ${hint}`}
      </small>
    </div>
  );
}
