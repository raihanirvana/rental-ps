import { useEffect, useState } from 'react';
import { getJson } from './lib/api.js';

export function useHealth() {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    getJson('/api/health', { signal: controller.signal })
      .then((body) => setState({ status: 'ok', service: body.service }))
      .catch((error) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', message: error.message });
        }
      });
    return () => controller.abort();
  }, []);
  return state;
}
