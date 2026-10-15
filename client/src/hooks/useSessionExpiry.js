import { useEffect } from 'react';
import { isCurrentSessionRevision, sessionRevision } from '../lib/session-revision.js';
import { getSession } from '../lib/session-api.js';

// Batas waktu setTimeout browser (~24,8 hari); TTL demo jauh di bawahnya.
const maxDelayMs = 2 ** 31 - 1;

// Saat masa berlaku ruang demo lewat, server ditanya ulang. Cookie ber-Expires sama
// dengan akhir workspace sehingga browser bisa sudah membuangnya (server lalu melihat
// "tanpa sesi"). Karena waktunya memang habis, 401 apa pun di sini berarti sesi berakhir.
function checkExpiry(controller, revision, onExpired) {
  return () =>
    getSession(controller.signal).catch((error) => {
      const current = !controller.signal.aborted && isCurrentSessionRevision(revision);
      if (error.status === 401 && current) {
        onExpired();
      }
    });
}

export function useSessionExpiry(session, onExpired) {
  const expiresAt = session?.expiresAt;
  const revision = sessionRevision();
  useEffect(() => {
    if (!expiresAt) {
      return undefined;
    }
    const controller = new AbortController();
    const delay = Math.min(Date.parse(expiresAt) - Date.now() + 1000, maxDelayMs);
    const check = checkExpiry(controller, revision, onExpired);
    const timer = window.setTimeout(check, Math.max(delay, 0));
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [expiresAt, revision, onExpired]);
}
