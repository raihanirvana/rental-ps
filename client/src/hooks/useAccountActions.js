import { useCallback, useState } from 'react';
import { navigate } from '../lib/router.js';
import { roleHome } from '../lib/routes.js';
import { useSession } from './useSession.js';

const otherRole = { customer: 'owner', owner: 'customer' };

// Menjalankan satu aksi async dengan status sibuk dan error yang bisa ditampilkan.
function useActionRunner() {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const run = useCallback(async (kind, action) => {
    setBusy(kind);
    setError(null);
    try {
      await action();
    } catch (actionError) {
      setError(actionError);
    } finally {
      setBusy(null);
    }
  }, []);
  return { busy, error, run };
}

// Ganti peran (workspace sama) dan keluar demo (workspace dihapus) dari header aplikasi.
export function useAccountActions() {
  const { session, startSession, signOut } = useSession();
  const { busy, error, run } = useActionRunner();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const target = otherRole[session.role];
  const switchRole = () =>
    run('switch', async () => {
      await startSession(target);
      navigate(roleHome[target]);
    });
  const logout = () =>
    run('logout', async () => {
      await signOut();
      navigate('/');
    });
  return { target, busy, error, switchRole, logout, confirmingLogout, setConfirmingLogout };
}
