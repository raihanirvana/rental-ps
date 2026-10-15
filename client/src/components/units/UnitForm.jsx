import { ErrorNotice } from '../Notice.jsx';
import { TextField } from '../TextField.jsx';

function KindField({ form }) {
  return (
    <fieldset className="fieldset kind-field" disabled={form.busy}>
      <legend>Jenis</legend>
      <div className="duration-picker">
        {['PS4', 'PS5'].map((kind) => (
          <label key={kind} className="choice">
            <input
              type="radio"
              name="unit-kind"
              value={kind}
              checked={form.values.kind === kind}
              onChange={() => form.setValue('kind', kind)}
            />
            <span className="duration-choice">{kind}</span>
          </label>
        ))}
      </div>
      {form.fieldErrors.kind ? (
        <small className="field-error">{form.fieldErrors.kind}</small>
      ) : null}
    </fieldset>
  );
}

function UnitFields({ form }) {
  const field = (name) => ({
    id: `unit-${name}`,
    value: form.values[name],
    error: form.fieldErrors[name],
    onChange: (event) => form.setValue(name, event.target.value),
    disabled: form.busy,
  });
  return (
    <div className="unit-fields">
      <TextField {...field('name')} label="Nama unit" maxLength={40} autoComplete="off" />
      <TextField
        {...field('hourlyRate')}
        label="Tarif per jam (Rp)"
        inputMode="numeric"
        autoComplete="off"
        hint="Contoh: 15000"
      />
      <KindField form={form} />
    </div>
  );
}

function UnitFormActions({ form, full }) {
  const label = form.editing ? 'Simpan perubahan' : 'Tambah unit';
  return (
    <div className="form-actions">
      <button type="submit" className="button" disabled={form.busy || full}>
        {form.busy ? 'Menyimpan…' : label}
      </button>
      {form.editing ? (
        <button
          type="button"
          className="button button--white"
          onClick={form.cancelEdit}
          disabled={form.busy}
        >
          Batal ubah
        </button>
      ) : null}
    </div>
  );
}

// Perubahan tarif/nama hanya berlaku untuk booking baru; snapshot booking lama tetap.
export function UnitForm({ form, unitCount, maxUnits }) {
  const full = !form.editing && unitCount >= maxUnits;
  return (
    <form
      className="panel unit-form"
      noValidate
      onSubmit={form.submit}
      aria-labelledby="unit-form-title"
    >
      <h2 id="unit-form-title">{form.editing ? `Ubah ${form.editing.name}` : 'Tambah unit'}</h2>
      <p>
        Perubahan nama/tarif hanya berlaku untuk booking baru. Booking lama tetap memakai data saat
        dibuat.
      </p>
      <UnitFields form={form} />
      {full ? (
        <p className="field-error">{`Sudah ${maxUnits} unit, batas maksimal ruang demo.`}</p>
      ) : null}
      {form.error && !form.error.fields ? <ErrorNotice error={form.error} /> : null}
      <UnitFormActions form={form} full={full} />
    </form>
  );
}
