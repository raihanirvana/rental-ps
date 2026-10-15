import { useId } from 'react';
import { useModalDialog } from '../../hooks/useModalDialog.js';
import { ErrorNotice, Notice, RefreshErrorNotice } from '../Notice.jsx';
import { AgendaDetailActions } from './AgendaDetailActions.jsx';
import { BlockDetailBody, BookingDetailBody } from './AgendaDetailBody.jsx';

function DialogContent({ detail, agenda, unitNames, titleId }) {
  const item = detail.item;
  return (
    <>
      <h2 id={titleId}>{item.kind === 'block' ? 'Blok jadwal' : item.reference}</h2>
      {item.kind === 'block' ? (
        <BlockDetailBody block={item} unitName={unitNames.get(item.unitId)} />
      ) : (
        <BookingDetailBody booking={item} />
      )}
      {detail.message ? <Notice tone="success">{detail.message}</Notice> : null}
      {detail.error ? <ErrorNotice error={detail.error} /> : null}
      <RefreshErrorNotice resource={agenda} />
      <AgendaDetailActions detail={detail} />
    </>
  );
}

// Detail booking/blok dari data agenda server. Escape menutup kecuali saat memproses.
export function AgendaDetailDialog({ detail, agenda, unitNames }) {
  const dialogRef = useModalDialog(Boolean(detail.item));
  const titleId = useId();
  function handleCancel(event) {
    event.preventDefault();
    detail.close();
  }
  return (
    <dialog
      ref={dialogRef}
      className="agenda-dialog"
      aria-labelledby={titleId}
      onCancel={handleCancel}
    >
      {detail.item ? (
        <DialogContent detail={detail} agenda={agenda} unitNames={unitNames} titleId={titleId} />
      ) : null}
    </dialog>
  );
}
