import { formatRupiah } from '../../lib/format.js';

function UnitChoice({ unit, checked, onChange }) {
  return (
    <label className="choice">
      <input
        type="radio"
        name="unit"
        value={unit.id}
        checked={checked}
        disabled={!unit.isActive}
        onChange={() => onChange(unit.id)}
      />
      <span className="unit-choice">
        <span className="unit-dot" aria-hidden="true" />
        <strong>{unit.name}</strong>
        <small>{unit.isActive ? `${formatRupiah(unit.hourlyRate)} / jam` : 'Nonaktif'}</small>
      </span>
    </label>
  );
}

// Radio native: panah kiri/kanan berpindah unit; tarif per jam terlihat untuk dibandingkan.
export function UnitPicker({ units, value, onChange }) {
  return (
    <fieldset className="fieldset">
      <legend>Pilih unit</legend>
      <div className="unit-picker">
        {units.map((unit) => (
          <UnitChoice key={unit.id} unit={unit} checked={unit.id === value} onChange={onChange} />
        ))}
      </div>
    </fieldset>
  );
}
