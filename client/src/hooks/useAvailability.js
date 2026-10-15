import { useCallback, useEffect, useState } from 'react';
import { getAvailability } from '../lib/booking-api.js';

const idle = { key: null, status: 'idle', data: null, error: null };

// Setiap kombinasi unit/tanggal/durasi punya key. Fetch lama dibatalkan dan responsnya
// diabaikan, sehingga respons terlambat tidak pernah menimpa pilihan terbaru.
export function useAvailability({ unitId, date, durationMinutes }, enabled) {
  const [state, setState] = useState(idle);
  const [attempt, setAttempt] = useState(0);
  const key = `${unitId}|${date}|${durationMinutes}|${attempt}`;
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    let active = true;
    const controller = new AbortController();
    setState({ key, status: 'loading', data: null, error: null });
    getAvailability({ unitId, date, durationMinutes }, controller.signal)
      .then((data) => active && setState({ key, status: 'ready', data, error: null }))
      .catch((error) => active && setState({ key, status: 'error', data: null, error }));
    return () => {
      active = false;
      controller.abort();
    };
  }, [key, enabled, unitId, date, durationMinutes]);
  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const current =
    enabled && state.key === key ? state : { ...idle, key, status: enabled ? 'loading' : 'idle' };
  return { ...current, reload };
}
