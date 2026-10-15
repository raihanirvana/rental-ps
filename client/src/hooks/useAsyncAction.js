import { useCallback, useRef, useState } from 'react';

// Satu aksi async dengan status sibuk/error; klik ganda dalam satu tick diabaikan.
export function useAsyncAction() {
  const [state, setState] = useState({ busy: false, error: null });
  const running = useRef(false);
  const run = useCallback(async (action) => {
    if (running.current) {
      return undefined;
    }
    running.current = true;
    setState({ busy: true, error: null });
    try {
      const result = await action();
      setState({ busy: false, error: null });
      return result;
    } catch (error) {
      setState({ busy: false, error });
      return undefined;
    } finally {
      running.current = false;
    }
  }, []);
  const reset = useCallback(() => setState({ busy: false, error: null }), []);
  return { ...state, run, reset };
}
