import { useCallback, useState } from 'react';
import { navigate } from '../lib/router.js';
import { useSession } from './useSession.js';

// CTA demo: sesi dengan peran sama langsung dibuka; selain itu server membuat ruang demo
// baru (tanpa sesi) atau mengganti peran di workspace yang sama.
export function useDemoStart() {
  const { session, startSession } = useSession();
  const [pendingRole, setPendingRole] = useState(null);
  const [error, setError] = useState(null);
  const start = useCallback(
    async (role, destination) => {
      setError(null);
      if (session?.role === role) {
        navigate(destination);
        return;
      }
      setPendingRole(role);
      try {
        await startSession(role);
        navigate(destination);
      } catch (startError) {
        setError(startError);
      } finally {
        setPendingRole(null);
      }
    },
    [session?.role, startSession],
  );
  return { start, pendingRole, error };
}
