import { formatRupiah } from '../../lib/format.js';
import { RowButton } from './RowButton.jsx';

function StatusButton({ unit, status }) {
  const props = { target: unit.name, disabled: status.busy };
  return unit.isActive ? (
    <RowButton {...props} label="Nonaktifkan" onClick={() => status.askDeactivate(unit)} />
  ) : (
    <RowButton {...props} label="Aktifkan" onClick={() => status.activate(unit)} />
  );
}

function UnitActions({ unit, form, status }) {
  return (
    <div className="row-actions">
      <RowButton
        label="Ubah"
        target={unit.name}
        quiet={false}
        onClick={() => form.startEdit(unit)}
        disabled={form.busy}
      />
      <StatusButton unit={unit} status={status} />
    </div>
  );
}

function UnitState({ unit }) {
  const pending =
    unit.pendingBookings > 0
      ? `${unit.pendingBookings} booking belum berakhir`
      : 'Tanpa booking mendatang';
  return (
    <div className="unit-state">
      <span className={`status-badge status-badge--${unit.isActive ? 'upcoming' : 'cancelled'}`}>
        {unit.isActive ? 'Aktif' : 'Nonaktif'}
      </span>
      <small>{pending}</small>
    </div>
  );
}

export function UnitList({ units, form, status }) {
  return (
    <ul className="unit-rows" aria-label="Daftar unit">
      {units.map((unit) => (
        <li key={unit.id} className="unit-row">
          <div>
            <strong>{unit.name}</strong>
            <span className="unit-meta">
              {`${unit.kind} · ${formatRupiah(unit.hourlyRate)} / jam`}
            </span>
          </div>
          <UnitState unit={unit} />
          <UnitActions unit={unit} form={form} status={status} />
        </li>
      ))}
    </ul>
  );
}
