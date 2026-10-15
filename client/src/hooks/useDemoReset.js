import { useState } from 'react';
import { resetDemo } from '../lib/settings-api.js';
import { isCurrentSessionRevision, sessionRevision } from '../lib/session-revision.js';
import { useAsyncAction } from './useAsyncAction.js';
import { useSession } from './useSession.js';

// Reset hanya setelah dialog disetujui. Versi data baru dari server me-mount ulang halaman,
// sehingga pilihan/detail lama dan respons yang dimulai sebelum reset tidak ditampilkan.
export function useDemoReset() {
  const { session, applyDataVersion } = useSession();
  const [open, setOpen] = useState(false);
  const action = useAsyncAction();
  const confirm = async () => {
    const revision = sessionRevision();
    const result = await action.run(resetDemo);
    if (result && isCurrentSessionRevision(revision)) {
      setOpen(false);
      applyDataVersion(result.dataVersion, session);
    }
  };
  const ask = () => {
    action.reset();
    setOpen(true);
  };
  const close = () => !action.busy && setOpen(false);
  return { open, busy: action.busy, error: action.error, ask, close, confirm };
}
