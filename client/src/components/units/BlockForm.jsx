import { blockFieldProps, endOptions, startOptions, unitOptions } from '../../lib/block-fields.js';
import { ErrorNotice } from '../Notice.jsx';
import { SelectField } from '../SelectField.jsx';
import { TextField } from '../TextField.jsx';

function BlockTimeFields({ form }) {
  const select = (name) => ({
    ...blockFieldProps(form, name),
    onChange: (value) => form.setValue(name, value),
  });
  return (
    <div className="field-row">
      <SelectField {...select('startTime')} label="Mulai" options={startOptions} />
      <SelectField {...select('endTime')} label="Selesai" options={endOptions} />
    </div>
  );
}

function BlockFields({ form, units, range }) {
  const text = (name) => ({
    ...blockFieldProps(form, name),
    onChange: (event) => form.setValue(name, event.target.value),
  });
  return (
    <div className="block-fields">
      <SelectField
        {...blockFieldProps(form, 'unitId')}
        label="Unit"
        options={unitOptions(units)}
        onChange={(value) => form.setValue('unitId', value)}
      />
      <TextField {...text('date')} label="Tanggal" type="date" min={range.from} max={range.to} />
      <BlockTimeFields form={form} />
      <TextField
        {...text('note')}
        label="Catatan (opsional)"
        maxLength={120}
        hint="Contoh: maintenance kontroler."
      />
    </div>
  );
}

// Blok tidak bisa menimpa booking aktif atau blok lain; server menolak dengan 409.
export function BlockForm({ form, units, range }) {
  return (
    <form
      className="panel block-form"
      noValidate
      onSubmit={form.submit}
      aria-labelledby="block-form-title"
    >
      <h2 id="block-form-title">Tambah blok jadwal</h2>
      <p>
        Jam yang diblokir tidak bisa dipesan pelanggan. Booking yang sudah ada tidak dibatalkan
        otomatis.
      </p>
      <BlockFields form={form} units={units} range={range} />
      {form.error && !form.error.fields ? <ErrorNotice error={form.error} /> : null}
      <div className="form-actions">
        <button type="submit" className="button" disabled={form.busy}>
          {form.busy ? 'Menyimpan…' : 'Tambah blok'}
        </button>
      </div>
    </form>
  );
}
