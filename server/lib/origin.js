// Bentuk kanonis origin HTTP(S) tanpa kredensial, path, query atau fragment; null bila tidak sah.
export function normalizeOrigin(value) {
  if (typeof value !== 'string' || !value || /\s/.test(value)) {
    return null;
  }
  try {
    const url = new URL(value);
    const plain = !url.username && !url.password && url.pathname === '/' && !url.search;
    const valid = ['http:', 'https:'].includes(url.protocol) && plain && !url.hash;
    return valid ? url.origin : null;
  } catch {
    return null;
  }
}
