import { useCallback, useRef, useState } from 'react';
import { completeBooking } from '../lib/agenda-api.js';
import { validateReason } from '../lib/cancel-reason.js';
import { cancelBooking } from '../lib/my-bookings-api.js';

const idle = { selected: null, mode: 'view', reason: '', busy: false, error: null, message: null };

function findSelected(data, selected) {
  if (!selected || !data) {
    return null;
  }
  const list = selected.kind === 'block' ? data.blocks : data.bookings;
  const found = list.find((item) => item.id === selected.id);
  return found ? { ...found, kind: selected.kind } : null;
}

// Respons cancel tidak membawa field khusus agenda; pertahankan penanda data contoh.
function mergeBooking(previous, booking) {
  return { ...previous, ...booking, canComplete: booking.canComplete ?? false };
}

async function runMutation({ agenda, item, request, message, runtime, setState }) {
  if (runtime.busy) {
    return;
  }
  runtime.busy = true;
  setState((current) => ({ ...current, busy: true, error: null, message: null }));
  try {
    const result = await request();
    agenda.replaceBooking(mergeBooking(item, result.booking));
    setState((current) => ({ ...current, busy: false, mode: 'view', reason: '', message }));
  } catch (error) {
    setState((current) => ({ ...current, busy: false, error }));
  } finally {
    runtime.busy = false;
    agenda.refresh();
  }
}

export function useAgendaDetail(agenda) {
  const [state, setState] = useState(idle);
  const runtime = useRef({ busy: false });
  const item = findSelected(agenda.data, state.selected);
  const mutate = (request, message) =>
    runMutation({ agenda, item, request, message, runtime: runtime.current, setState });
  const open = useCallback((selected) => setState({ ...idle, selected }), []);
  const close = useCallback(() => setState((current) => (current.busy ? current : idle)), []);
  const setMode = (mode) =>
    setState((current) => ({ ...current, mode, error: null, message: null }));
  const setReason = (reason) => setState((current) => ({ ...current, reason, error: null }));
  const confirmCancel = () => {
    const reasonError = validateReason(state.reason);
    if (reasonError) {
      setState((current) => ({ ...current, error: { message: reasonError } }));
      return;
    }
    mutate(() => cancelBooking(item.id, state.reason.trim()), 'Booking dibatalkan.');
  };
  const complete = () => mutate(() => completeBooking(item.id), 'Booking ditandai selesai.');
  return { ...state, item, open, close, setMode, setReason, confirmCancel, complete };
}
