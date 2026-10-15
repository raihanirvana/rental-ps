import { useEffect, useRef } from 'react';

// Membuka <dialog> sebagai modal (fokus terkunci, latar inert) dan mengembalikan fokus
// ke elemen pemicu saat ditutup.
export function useModalDialog(open) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) {
      return undefined;
    }
    const opener = document.activeElement;
    if (!dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog.open) {
        dialog.close();
      }
      if (opener?.isConnected) {
        opener.focus();
      }
    };
  }, [open]);
  return dialogRef;
}
