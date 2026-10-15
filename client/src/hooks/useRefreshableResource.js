import { useCallback, useEffect, useRef, useState } from 'react';
import { currentResource, emptyResource } from '../lib/load-resource.js';

function isReady(state, key) {
  return state.key === key && state.status === 'ready';
}

async function fetchResource({ key, request, setState, runtime, sequence, background }) {
  try {
    const data = await request(runtime.controller.signal);
    if (runtime.sequence === sequence) {
      setState({ key, status: 'ready', data, error: null, refreshError: null });
    }
  } catch (error) {
    if (runtime.sequence !== sequence || error.name === 'AbortError') {
      return;
    }
    setState((current) =>
      background && isReady(current, key)
        ? { ...current, refreshError: error }
        : { ...emptyResource, key, status: 'error', error },
    );
  }
}

function reloadResource(key, request, setState, runtime, background) {
  if (runtime.key !== key) {
    return;
  }
  runtime.controller?.abort();
  runtime.controller = new AbortController();
  const sequence = ++runtime.sequence;
  setState((current) =>
    background && isReady(current, key)
      ? { ...current, refreshError: null }
      : { ...emptyResource, key },
  );
  return fetchResource({ key, request, setState, runtime, sequence, background });
}

function updateResource(runtime, key, setState, transform) {
  if (runtime.key !== key) {
    return;
  }
  runtime.controller?.abort();
  runtime.sequence += 1;
  setState((current) =>
    isReady(current, key) ? { ...current, data: transform(current.data) } : current,
  );
}

function activateResource(runtime, key, reload) {
  runtime.key = key;
  reload(false);
  return () => {
    runtime.key = null;
    runtime.sequence += 1;
    runtime.controller?.abort();
  };
}

// Muat awal, refresh dan hasil mutasi berbagi urutan request. Respons lama tidak menimpa
// resource baru; kegagalan refresh tetap terlihat tanpa membuang data yang sedang dibaca.
export function useRefreshableResource(key, request) {
  const [state, setState] = useState(emptyResource);
  const runtime = useRef({ key: null, sequence: 0, controller: null });
  const reload = useCallback(
    (background) => reloadResource(key, request, setState, runtime.current, background),
    [key, request],
  );
  useEffect(() => activateResource(runtime.current, key, reload), [key, reload]);
  const update = useCallback(
    (transform) => updateResource(runtime.current, key, setState, transform),
    [key],
  );
  return {
    ...currentResource(state, key),
    retry: () => reload(false),
    refresh: () => reload(true),
    update,
  };
}
