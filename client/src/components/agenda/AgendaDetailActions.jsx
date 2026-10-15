import { maxReasonLength } from '../../lib/cancel-reason.js';

function ReasonInput({ detail }) {
  return (
    <>
      <label className="field-label" htmlFor="agenda-cancel-reason">
        Alasan pembatalan (opsional)
      </label>
      <textarea
        id="agenda-cancel-reason"
        className="input"
        rows={3}
        maxLength={maxReasonLength}
        value={detail.reason}
        disabled={detail.busy}
        onChange={(event) => detail.setReason(event.target.value)}
      />
    </>
  );
}

function CancelForm({ detail }) {
  return (
    <div className="reason-field">
      <ReasonInput detail={detail} />
      <div className="dialog-actions">
        <button
          type="button"
          className="button button--white"
          onClick={() => detail.setMode('view')}
          disabled={detail.busy}
        >
          Kembali
        </button>
        <button
          type="button"
          className="button button--danger"
          onClick={detail.confirmCancel}
          disabled={detail.busy}
        >
          {detail.busy ? 'Membatalkan…' : 'Batalkan booking'}
        </button>
      </div>
    </div>
  );
}

function DialogButton({ className, onClick, disabled, children }) {
  return (
    <button type="button" className={`button ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function ViewActions({ booking, detail }) {
  return (
    <div className="dialog-actions">
      {booking?.canCancel ? (
        <DialogButton
          className="button--white"
          onClick={() => detail.setMode('cancel')}
          disabled={detail.busy}
        >
          Batalkan
        </DialogButton>
      ) : null}
      {booking?.canComplete ? (
        <DialogButton className="" onClick={detail.complete} disabled={detail.busy}>
          {detail.busy ? 'Menyimpan…' : 'Tandai selesai'}
        </DialogButton>
      ) : null}
      <DialogButton className="button--quiet" onClick={detail.close} disabled={detail.busy}>
        Tutup
      </DialogButton>
    </div>
  );
}

// Tombol hanya muncul bila server menyatakan transisi boleh (canComplete/canCancel);
// server tetap memeriksa ulang di transaksi.
export function AgendaDetailActions({ detail }) {
  const booking = detail.item?.kind === 'block' ? null : detail.item;
  if (booking && detail.mode === 'cancel') {
    return <CancelForm detail={detail} />;
  }
  return <ViewActions booking={booking} detail={detail} />;
}
