import { useEffect, useRef } from 'react';
import { openModal } from '../lib/dialog-focus.js';

// Membuka <dialog> sebagai modal (fokus terkunci, latar inert) dan mengembalikan fokus
// ke elemen pemicu saat ditutup.
export function useModalDialog(open) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) {
      return undefined;
    }
    return openModal(dialog);
  }, [open]);
  return dialogRef;
}
