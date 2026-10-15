import { agendaHref, shiftDate, statusFilters } from '../../lib/agenda-view.js';
import { navigate } from '../../lib/router.js';

function SmallButton({ label, children, onClick }) {
  return (
    <button type="button" className="small-button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function DateRow({ date, go }) {
  return (
    <div className="date-row">
      <SmallButton label="Hari sebelumnya" onClick={() => go(shiftDate(date, -1))}>
        ‹
      </SmallButton>
      <input
        id="agenda-date"
        className="input"
        type="date"
        value={date}
        onChange={(event) => event.target.value && go(event.target.value)}
      />
      <SmallButton label="Hari berikutnya" onClick={() => go(shiftDate(date, 1))}>
        ›
      </SmallButton>
      <SmallButton onClick={() => go(null)}>Hari ini</SmallButton>
    </div>
  );
}

function DateControls({ filters, date }) {
  const go = (next) => navigate(agendaHref({ ...filters, date: next }));
  return (
    <div className="date-controls">
      <label className="field-label" htmlFor="agenda-date">
        Tanggal agenda
      </label>
      <DateRow date={date} go={go} />
    </div>
  );
}

function FilterSelect({ id, label, value, options, onChange }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value || null)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function unitOptions(units) {
  return [
    { value: '', label: 'Semua unit' },
    ...units.map((unit) => ({ value: unit.id, label: unit.name })),
  ];
}

// Filter disimpan di URL; respons filter lama diabaikan oleh useAgenda.
export function AgendaControls({ filters, date, units }) {
  const set = (patch) => navigate(agendaHref({ ...filters, ...patch }));
  return (
    <div className="owner-controls">
      <DateControls filters={filters} date={date} />
      <FilterSelect
        id="agenda-unit"
        label="Unit"
        value={filters.unitId ?? ''}
        options={unitOptions(units)}
        onChange={(unitId) => set({ unitId })}
      />
      <FilterSelect
        id="agenda-status"
        label="Status"
        value={filters.status ?? ''}
        options={statusFilters}
        onChange={(status) => set({ status })}
      />
    </div>
  );
}
