import { useCallback, useRef, useState } from 'react';
import { validateReason } from '../lib/cancel-reason.js';
import { cancelBooking } from '../lib/my-bookings-api.js';

const closed = { visible: false, reason: '', busy: false, error: null, reasonError: null };

// Penolakan status dari server (409/404) menutup dialog dan dilaporkan ke halaman, yang lalu
// memuat ulang detail. Error lain (jaringan/503) tetap di dialog agar bisa dicoba lagi.
async function runCancel({ booking, state, setState, runtime, onCancelled, onRejected }) {
  const reasonError = validateReason(state.reason);
  if (runtime.busy || reasonError) {
    setState((current) => ({ ...current, reasonError }));
    return;
  }
  runtime.busy = true;
  setState((current) => ({ ...current, busy: true, error: null }));
  try {
    onCancelled(await cancelBooking(booking.id, state.reason.trim()));
    setState(closed);
  } catch (error) {
    const rejected = error.status === 409 || error.status === 404;
    setState(rejected ? closed : (current) => ({ ...current, busy: false, error }));
    if (rejected) {
      onRejected(error);
    }
  } finally {
    runtime.busy = false;
  }
}

export function useCancelBooking(booking, { onCancelled, onRejected }) {
  const [state, setState] = useState(closed);
  const runtime = useRef({ busy: false });
  const open = useCallback(() => setState({ ...closed, visible: true }), []);
  const close = useCallback(() => setState(closed), []);
  const setReason = useCallback((reason) => {
    setState((current) => ({ ...current, reason, reasonError: null }));
  }, []);
  const confirm = () =>
    runCancel({ booking, state, setState, runtime: runtime.current, onCancelled, onRejected });
  return { ...state, open, close, setReason, confirm };
}
