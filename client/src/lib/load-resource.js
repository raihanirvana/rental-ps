// Memuat satu resource untuk `key`. Request lama dibatalkan; responsnya diabaikan sehingga
// data/label lama tidak pernah tampil untuk key baru.
export function loadResource(key, request, setState) {
  const controller = new AbortController();
  let active = true;
  setState({ key, status: 'loading', data: null, error: null });
  request(controller.signal)
    .then((data) => active && setState({ key, status: 'ready', data, error: null }))
    .catch((error) => {
      if (active && error.name !== 'AbortError') {
        setState({ key, status: 'error', data: null, error });
      }
    });
  return () => {
    active = false;
    controller.abort();
  };
}

export const emptyResource = { key: null, status: 'loading', data: null, error: null };

export function currentResource(state, key) {
  return state.key === key ? state : { ...emptyResource, key };
}
