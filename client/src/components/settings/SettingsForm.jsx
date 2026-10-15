import { FieldError } from '../FieldError.jsx';
import { ErrorNotice } from '../Notice.jsx';
import { TextField } from '../TextField.jsx';

function ContactField({ form }) {
  const error = form.fieldErrors.contactNote;
  return (
    <div>
      <label className="field-label" htmlFor="settings-contactNote">
        Teks kontak (opsional)
      </label>
      <textarea
        id="settings-contactNote"
        className="input"
        rows={3}
        maxLength={200}
        value={form.values.contactNote}
        disabled={form.busy}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'settings-contactNote-error' : undefined}
        onChange={(event) => form.setValue('contactNote', event.target.value)}
      />
      <FieldError id="settings-contactNote-error" error={error} />
    </div>
  );
}

function textProps(form, name) {
  return {
    id: `settings-${name}`,
    value: form.values[name],
    error: form.fieldErrors[name],
    disabled: form.busy,
    onChange: (event) => form.setValue(name, event.target.value),
  };
}

export function SettingsForm({ form }) {
  return (
    <form
      className="panel settings-form"
      noValidate
      onSubmit={form.submit}
      aria-labelledby="settings-form-title"
    >
      <h2 id="settings-form-title">Identitas usaha contoh</h2>
      <p>Dipakai di halaman pelanggan ruang demo ini. Gunakan data contoh, bukan data pribadi.</p>
      <div className="unit-fields">
        <TextField {...textProps(form, 'businessName')} label="Nama usaha" maxLength={60} />
        <TextField {...textProps(form, 'address')} label="Alamat" maxLength={150} />
        <ContactField form={form} />
      </div>
      {form.error && !form.error.fields ? <ErrorNotice error={form.error} /> : null}
      <div className="form-actions">
        <button type="submit" className="button" disabled={form.busy}>
          {form.busy ? 'Menyimpan…' : 'Simpan pengaturan'}
        </button>
      </div>
    </form>
  );
}
