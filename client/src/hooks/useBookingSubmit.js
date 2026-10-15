import { useCallback, useEffect, useRef, useState } from 'react';
import { createBooking } from '../lib/booking-api.js';
import { contactFieldErrors, scheduleErrorCodes, timeoutError } from '../lib/booking-errors.js';
import { keyFor } from '../lib/idempotency.js';

const timeoutMs = 15000;
const idleState = { status: 'idle', error: null, fieldErrors: {}, result: null };

// Satu request dengan batas waktu. Timeout tidak memicu request baru secara otomatis.
async function sendWithTimeout(payload, runtime) {
  const controller = new AbortController();
  runtime.controller = controller;
  let timedOut = false;
  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    return await createBooking(payload, controller.signal);
  } catch (error) {
    throw timedOut ? timeoutError : error;
  } finally {
    window.clearTimeout(timer);
  }
}

function failureState(error, runtime, onScheduleError) {
  if (error.code === 'IDEMPOTENCY_CONFLICT') {
    runtime.key = null;
  }
  if (scheduleErrorCodes.has(error.code)) {
    onScheduleError(error);
    return idleState;
  }
  return { ...idleState, status: 'failed', error, fieldErrors: contactFieldErrors(error) };
}

// Klik ganda diabaikan (inFlight). Respons setelah halaman ditinggalkan diabaikan.
async function runSubmit(runtime, payload, setState, onScheduleError) {
  if (runtime.inFlight) {
    return;
  }
  runtime.inFlight = true;
  runtime.key = keyFor(runtime.key, payload);
  setState({ ...idleState, status: 'submitting' });
  try {
    const result = await sendWithTimeout({ ...payload, idempotencyKey: runtime.key.key }, runtime);
    if (!runtime.unmounted) {
      setState({ ...idleState, status: 'done', result });
    }
  } catch (error) {
    if (!runtime.unmounted) {
      setState(failureState(error, runtime, onScheduleError));
    }
  } finally {
    runtime.inFlight = false;
  }
}

export function useBookingSubmit(onScheduleError) {
  const [state, setState] = useState(idleState);
  const runtimeRef = useRef({ key: null, controller: null, inFlight: false, unmounted: false });
  useEffect(() => {
    const runtime = runtimeRef.current;
    runtime.unmounted = false;
    return () => {
      runtime.unmounted = true;
      runtime.controller?.abort();
    };
  }, []);
  const submit = useCallback(
    (payload) => runSubmit(runtimeRef.current, payload, setState, onScheduleError),
    [onScheduleError],
  );
  const reset = useCallback(() => {
    runtimeRef.current.key = null;
    setState(idleState);
  }, []);
  return { ...state, submitting: state.status === 'submitting', submit, reset };
}
