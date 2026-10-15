import { useEffect } from 'react';
import { useCatalog } from './useCatalog.js';
import { useSession } from './useSession.js';

// Cookie dapat hilang karena logout tab lain di antara cek sesi dan GET katalog.
// Data publik ber-ID null bukan katalog yang bisa dipakai untuk booking.
export function useWorkspaceCatalog() {
  const { session, reload } = useSession();
  const catalog = useCatalog(session?.startedAt);
  const anonymous = catalog.status === 'ready' && catalog.catalog?.source !== 'workspace';
  useEffect(() => {
    if (anonymous) {
      reload();
    }
  }, [anonymous, reload]);
  return anonymous ? { ...catalog, status: 'loading', catalog: null } : catalog;
}
