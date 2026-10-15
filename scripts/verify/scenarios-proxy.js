import { createClient } from './http.js';
import { codeOf } from './demo.js';
import { section } from './report.js';

// Browser di balik proxy HTTPS: Origin https://host dan X-Forwarded-Proto https.
function forwarded(base) {
  const origin = base.replace('http://', 'https://');
  return { headers: { Origin: origin, 'X-Forwarded-Proto': 'https' } };
}

async function trusted(report, base) {
  const client = createClient(base);
  const response = await client.post('/api/demo/sessions', { role: 'customer' }, forwarded(base));
  const cookie = response.headers.get('set-cookie') ?? '';
  const hsts = response.headers.get('strict-transport-security');
  const ok = response.status === 201 && /;\s*Secure/i.test(cookie) && Boolean(hsts);
  report.check(
    'TRUST_PROXY=loopback + HTTPS diteruskan: cookie Secure + HSTS',
    ok,
    `${response.status}`,
  );
}

async function untrusted(report, base) {
  const client = createClient(base);
  const response = await client.post('/api/demo/sessions', { role: 'customer' }, forwarded(base));
  const plain = await createClient(base).post(
    '/api/demo/sessions',
    { role: 'customer' },
    {
      headers: { 'X-Forwarded-Proto': 'https' },
    },
  );
  const cookie = plain.headers.get('set-cookie') ?? '';
  report.check(
    'TRUST_PROXY=false: X-Forwarded-Proto palsu tidak membuat origin HTTPS sah',
    response.status === 403,
    codeOf(response),
  );
  report.check(
    'TRUST_PROXY=false: cookie tanpa Secure meski header palsu',
    plain.status === 201 && !/;\s*Secure/i.test(cookie),
  );
}

export async function runProxyScenarios(report, trustedBase, plainBase) {
  section('Proxy tepercaya dan cookie Secure');
  await trusted(report, trustedBase);
  await untrusted(report, plainBase);
  await forwardedRate(report, trustedBase);
}

async function forwardedRate(report, base) {
  const client = createClient(base);
  const ip = { headers: { 'X-Forwarded-For': '192.0.2.1' } };
  const statuses = [];
  for (let index = 0; index < 4; index += 1) {
    statuses.push((await client.get('/api/catalog', ip)).status);
  }
  const other = await client.get('/api/catalog', {
    headers: { 'X-Forwarded-For': '192.0.2.2' },
  });
  report.check(
    'Proxy tepercaya: batas rate per IP terpisah',
    statuses.join(',') === '200,200,200,429' && other.status === 200,
  );
}
