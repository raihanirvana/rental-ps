import { useCallback, useEffect, useState } from 'react';
import { currentResource, emptyResource, loadResource } from '../lib/load-resource.js';
import { listMyBookings } from '../lib/my-bookings-api.js';
import { pageSize } from '../lib/my-bookings-view.js';

// Daftar per tab + halaman. Selama key baru dimuat, baris lama tidak ditampilkan.
export function useMyBookings(tab, page) {
  const [state, setState] = useState(emptyResource);
  const [attempt, setAttempt] = useState(0);
  const key = `${tab.view}|${page}|${attempt}`;
  useEffect(() => {
    const query = { view: tab.view, limit: pageSize, offset: (page - 1) * pageSize };
    return loadResource(key, (signal) => listMyBookings(query, signal), setState);
  }, [key, tab.view, page]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...currentResource(state, key), retry };
}
