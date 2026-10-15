import { useId } from 'react';
import { useModalDialog } from '../hooks/useModalDialog.js';

function DialogActions({ cancelLabel, confirmLabel, busyLabel, busy, onConfirm, onCancel }) {
  return (
    <div className="dialog-actions">
      <button type="button" className="button button--white" onClick={onCancel} disabled={busy}>
        {cancelLabel}
      </button>
      <button type="button" className="button button--danger" onClick={onConfirm} disabled={busy}>
        {busy ? busyLabel : confirmLabel}
      </button>
    </div>
  );
}

// <dialog> modal native: Escape menutup (kecuali saat memproses), fokus kembali ke pemicu.
export function ConfirmDialog({ open, title, children, busy, onCancel, ...actions }) {
  const dialogRef = useModalDialog(open);
  const titleId = useId();
  function handleCancel(event) {
    event.preventDefault();
    if (!busy) {
      onCancel();
    }
  }
  return (
    <dialog ref={dialogRef} onCancel={handleCancel} aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      {children}
      <DialogActions busy={busy} onCancel={onCancel} {...actions} />
    </dialog>
  );
}
