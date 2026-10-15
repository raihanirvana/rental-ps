import { formatDateKey, formatTimeRange } from '../../lib/booking-format.js';
import { maxReasonLength } from '../../lib/cancel-reason.js';
import { ConfirmDialog } from '../ConfirmDialog.jsx';
import { ErrorNotice } from '../Notice.jsx';

function ReasonField({ cancel }) {
  return (
    <div className="reason-field">
      <label className="field-label" htmlFor="cancel-reason">
        Alasan (opsional)
      </label>
      <textarea
        id="cancel-reason"
        className="input"
        rows={3}
        maxLength={maxReasonLength}
        value={cancel.reason}
        disabled={cancel.busy}
        aria-invalid={Boolean(cancel.reasonError)}
        aria-describedby={cancel.reasonError ? 'cancel-reason-error' : undefined}
        onChange={(event) => cancel.setReason(event.target.value)}
      />
      {cancel.reasonError ? (
        <small id="cancel-reason-error" className="field-error">
          {cancel.reasonError}
        </small>
      ) : null}
    </div>
  );
}

// Menutup dialog (Kembali/Escape) tidak mengirim apa pun dan tidak mengubah data.
export function CancelBookingDialog({ booking, cancel }) {
  const time = formatTimeRange(booking.startTime, booking.endTime);
  const when = `${formatDateKey(booking.date)}, ${time}`;
  return (
    <ConfirmDialog
      open={cancel.visible}
      title="Batalkan booking?"
      busy={cancel.busy}
      onCancel={cancel.close}
      onConfirm={cancel.confirm}
      cancelLabel="Kembali"
      confirmLabel="Batalkan booking"
      busyLabel="Membatalkan…"
    >
      <p>{`${booking.reference} · ${booking.unitName} · ${when}.`}</p>
      <p>Jam ini akan tersedia lagi untuk dipesan. Pembatalan tidak bisa diurungkan.</p>
      <ReasonField cancel={cancel} />
      {cancel.error ? <ErrorNotice error={cancel.error} /> : null}
    </ConfirmDialog>
  );
}
