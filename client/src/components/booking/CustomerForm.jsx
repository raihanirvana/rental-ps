import { useEffect, useRef } from 'react';
import { ErrorNotice } from '../Notice.jsx';
import { TextField } from '../TextField.jsx';

function fieldProps(customer, errors, name, disabled) {
  return {
    id: `booking-${name}`,
    value: customer.values[name],
    onChange: (event) => customer.update(name, event.target.value),
    error: errors[name],
    autoComplete: 'off',
    disabled,
  };
}

function CustomerFields({ customer, errors, disabled }) {
  return (
    <div className="field-row">
      <TextField
        {...fieldProps(customer, errors, 'customerName', disabled)}
        label="Nama pemesan"
        placeholder="Contoh: Raka"
        maxLength={60}
      />
      <TextField
        {...fieldProps(customer, errors, 'phone', disabled)}
        label="Nomor HP (opsional)"
        type="tel"
        inputMode="tel"
        hint="Boleh dikosongkan. Demo tidak mengirim pesan."
      />
    </div>
  );
}

// Fokus ke heading saat form dibuka, dan ke field invalid pertama dari error server.
function useFormFocus(serverErrors) {
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);
  useEffect(() => {
    const first = Object.keys(serverErrors)[0];
    if (first) {
      document.getElementById(`booking-${first}`)?.focus();
    }
  }, [serverErrors]);
  return headingRef;
}

export function CustomerForm({ flow, onSubmit }) {
  const { customer, submission } = flow;
  const headingRef = useFormFocus(submission.fieldErrors);
  const errors = { ...submission.fieldErrors, ...customer.errors };
  return (
    <section className="customer-fields" aria-labelledby="customer-title">
      <h2 id="customer-title" ref={headingRef} tabIndex={-1}>
        Siapa yang akan main?
      </h2>
      <p>Ini demo. Pakai nama contoh saja; nomor HP tidak wajib dan tidak akan dihubungi.</p>
      <form noValidate onSubmit={onSubmit}>
        <CustomerFields customer={customer} errors={errors} disabled={submission.submitting} />
        {submission.status === 'failed' ? <ErrorNotice error={submission.error} /> : null}
        <button className="button" type="submit" disabled={submission.submitting || !flow.slot}>
          {submission.submitting ? 'Menyimpan booking…' : 'Konfirmasi booking'}
        </button>
      </form>
    </section>
  );
}
