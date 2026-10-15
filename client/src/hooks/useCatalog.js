import { useCallback, useEffect, useState } from 'react';
import { getCatalog } from '../lib/session-api.js';

function loadCatalog(sessionKey, setState) {
  const controller = new AbortController();
  let active = true;
  setState((current) => ({ ...current, key: sessionKey, status: 'loading', error: null }));
  getCatalog(controller.signal)
    .then(
      (catalog) => active && setState({ key: sessionKey, status: 'ready', catalog, error: null }),
    )
    .catch((error) => {
      if (active && error.name !== 'AbortError') {
        setState({ key: sessionKey, status: 'error', catalog: null, error });
      }
    });
  return () => {
    active = false;
    controller.abort();
  };
}

// Katalog publik (tanpa sesi) atau katalog workspace (dengan sesi). Hanya GET; tidak
// pernah membuat workspace. `sessionKey` memicu muat ulang saat sesi/peran berganti.
export function useCatalog(sessionKey) {
  const [state, setState] = useState({ key: null, status: 'loading', catalog: null, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => loadCatalog(sessionKey, setState), [sessionKey, attempt]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const current =
    state.key === sessionKey ? state : { status: 'loading', catalog: null, error: null };
  return { ...current, retry };
}
