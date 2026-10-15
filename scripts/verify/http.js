// Klien HTTP dengan cookie jar per pengunjung. Mutasi mengirim Origin aplikasi seperti browser.
function storeCookies(jar, response) {
  for (const header of response.headers.getSetCookie()) {
    const [pair, ...attributes] = header.split(';');
    const [name, value] = pair.split('=');
    const expired = attributes.some((part) => /expires=thu, 01 jan 1970/i.test(part.trim()));
    if (expired || value === '') {
      jar.delete(name.trim());
    } else {
      jar.set(name.trim(), value);
    }
  }
}

function parse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function buildInit(base, jar, method, options) {
  const headers = { ...(options.headers ?? {}) };
  if (options.origin !== false && !['GET', 'HEAD'].includes(method)) {
    headers.Origin ??= base;
  }
  const cookie = [...jar].map(([name, value]) => `${name}=${value}`).join('; ');
  if (cookie) {
    headers.Cookie = cookie;
  }
  const init = { method, headers, redirect: 'manual' };
  if (options.body !== undefined) {
    headers['Content-Type'] ??= 'application/json';
    init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }
  return init;
}

export function createClient(base) {
  const jar = new Map();
  async function request(method, path, options = {}) {
    const response = await fetch(base + path, buildInit(base, jar, method, options));
    storeCookies(jar, response);
    const text = await response.text();
    return { status: response.status, headers: response.headers, json: parse(text), text };
  }
  return {
    jar,
    request,
    get: (path, options) => request('GET', path, options),
    post: (path, body, options = {}) => request('POST', path, { ...options, body }),
    patch: (path, body, options = {}) => request('PATCH', path, { ...options, body }),
    del: (path, options) => request('DELETE', path, options),
  };
}

// Klien baru ke server lain (mis. setelah restart) dengan cookie yang sama.
export function cloneClient(client, base) {
  const copy = createClient(base);
  for (const [name, value] of client.jar) {
    copy.jar.set(name, value);
  }
  return copy;
}
