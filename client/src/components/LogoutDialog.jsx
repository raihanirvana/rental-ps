import { ConfirmDialog } from './ConfirmDialog.jsx';
import { ErrorNotice } from './Notice.jsx';

export function LogoutDialog({ account }) {
  return (
    <ConfirmDialog
      open={account.confirmingLogout}
      title="Keluar demo?"
      busy={account.busy === 'logout'}
      onCancel={() => account.setConfirmingLogout(false)}
      onConfirm={account.logout}
      cancelLabel="Kembali"
      confirmLabel="Keluar dan hapus data"
      busyLabel="Menghapus ruang demo…"
    >
      <p>
        Ruang demo ini beserta booking dan perubahan di dalamnya akan dihapus. Kamu bisa memulai
        demo baru kapan saja dari halaman utama.
      </p>
      {account.error && account.confirmingLogout ? <ErrorNotice error={account.error} /> : null}
    </ConfirmDialog>
  );
}
