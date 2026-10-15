import { useSyncExternalStore } from 'react';

// Router kecil berbasis History API. Express dan Vite mengembalikan index.html untuk
// path selain /api, sehingga refresh/deep link di route mana pun aman.
const navigationEvent = 'sesi-play:navigate';

function currentHref() {
  return `${window.location.pathname}${window.location.search}`;
}

function subscribe(callback) {
  window.addEventListener('popstate', callback);
  window.addEventListener(navigationEvent, callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener(navigationEvent, callback);
  };
}

export function navigate(href, { replace = false } = {}) {
  if (href !== currentHref()) {
    window.history[replace ? 'replaceState' : 'pushState'](null, '', href);
    window.dispatchEvent(new Event(navigationEvent));
  }
}

export function useLocation() {
  const href = useSyncExternalStore(subscribe, currentHref);
  const url = new URL(href, window.location.origin);
  return { pathname: url.pathname, searchParams: url.searchParams };
}
