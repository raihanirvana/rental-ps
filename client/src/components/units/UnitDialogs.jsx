import { formatDateKey, formatTimeRange } from '../../lib/booking-format.js';
import { ConfirmDialog } from '../ConfirmDialog.jsx';
import { ErrorNotice } from '../Notice.jsx';

export function DeactivateDialog({ status }) {
  const unit = status.target;
  return (
    <ConfirmDialog
      open={Boolean(unit)}
      title={`Nonaktifkan ${unit?.name ?? 'unit'}?`}
      busy={status.busy}
      onCancel={status.close}
      onConfirm={status.confirm}
      cancelLabel="Kembali"
      confirmLabel="Nonaktifkan"
      busyLabel="Menyimpan…"
    >
      <p>
        Unit nonaktif tidak bisa dipesan pelanggan. Booking lama tetap tersimpan. Unit dengan
        booking yang belum berakhir tidak bisa dinonaktifkan.
      </p>
      {status.error ? <ErrorNotice error={status.error} /> : null}
    </ConfirmDialog>
  );
}

export function DeleteBlockDialog({ remover }) {
  const block = remover.target;
  const when = block
    ? `${formatDateKey(block.date)}, ${formatTimeRange(block.startTime, block.endTime)}`
    : '';
  return (
    <ConfirmDialog
      open={Boolean(block)}
      title="Hapus blok?"
      busy={remover.busy}
      onCancel={remover.close}
      onConfirm={remover.confirm}
      cancelLabel="Kembali"
      confirmLabel="Hapus blok"
      busyLabel="Menghapus…"
    >
      <p>
        {block ? `${block.unitName} · ${when}. Jam ini bisa dipesan lagi setelah dihapus.` : ''}
      </p>
      {remover.error ? <ErrorNotice error={remover.error} /> : null}
    </ConfirmDialog>
  );
}
