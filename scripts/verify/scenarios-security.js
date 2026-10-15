import { createClient } from './http.js';
import { bookingBody, codeOf, visitor } from './demo.js';
import { section } from './report.js';
import { runRequestErrorScenarios } from './scenarios-request-errors.js';

async function originChecks(report, client) {
  const evil = { headers: { Origin: 'https://evil.example' } };
  const foreign = await client.post('/api/demo/reset', { confirm: true }, evil);
  const ok = foreign.status === 403 && codeOf(foreign) === 'ORIGIN_REJECTED';
  report.check('Mutasi dari origin asing ditolak 403', ok, codeOf(foreign));
  const crossSite = { origin: false, headers: { 'Sec-Fetch-Site': 'cross-site' } };
  const site = await client.request('DELETE', '/api/session', crossSite);
  report.check('DELETE lintas situs tanpa Origin ditolak', site.status === 403, codeOf(site));
}

async function bodyChecks(report, demo, base) {
  const { client } = demo;
  const formType = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
  const form = await client.post('/api/bookings', 'role=owner', formType);
  report.check('Body non-JSON ditolak 415', form.status === 415, codeOf(form));
  const body = { ...bookingBody('x', demo.today, '10:00', 60), customerName: 'x'.repeat(110000) };
  const big = await client.post('/api/bookings', body);
  report.check('Body > 100 KB ditolak 413', big.status === 413, codeOf(big));
  const preflight = { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } };
  const options = await fetch(`${base}/api/bookings`, preflight);
  const cors = options.headers.get('access-control-allow-origin');
  report.check(
    'Tanpa CORS: tidak ada Access-Control-Allow-Origin',
    !cors,
    `OPTIONS ${options.status}`,
  );
}

async function originAndBody(report, demo, base) {
  await originChecks(report, demo.client);
  await bodyChecks(report, demo, base);
}

async function headers(report, base) {
  const page = await fetch(`${base}/booking`);
  const csp = page.headers.get('content-security-policy') ?? '';
  const ok =
    csp.includes("script-src 'self'") &&
    csp.includes("frame-ancestors 'none'") &&
    page.headers.get('x-frame-options') === 'DENY' &&
    page.headers.get('x-content-type-options') === 'nosniff';
  report.check(
    'Header CSP aset lokal, anti-iframe, nosniff',
    ok,
    csp.split('; ').slice(0, 3).join('; '),
  );
  const health = await fetch(`${base}/api/health`);
  report.check('API no-store', health.headers.get('cache-control') === 'no-store');
  report.check(
    'HSTS tidak dikirim pada HTTP biasa',
    !health.headers.get('strict-transport-security'),
  );
}

async function errorShape(report, client) {
  const json = { headers: { 'Content-Type': 'application/json' } };
  const bad = await client.post('/api/bookings', '{"unitId":', json);
  const stack = /\n\s+at |node:internal|\.m?js:\d/.test(bad.text);
  const ok = bad.status === 400 && !stack && Boolean(bad.json.error.requestId);
  report.check('Error JSON tanpa stack trace, dengan requestId', ok, codeOf(bad));
}

async function injection(report, demo) {
  const { client, units } = demo;
  const book = (time, customerName) =>
    client.post(
      '/api/bookings',
      bookingBody(units.get('PS4 B'), demo.day(9), time, 60, { customerName }),
    );
  const sql = await book('10:00', "%' OR 1=1 --");
  const stored = sql.json?.booking?.customerName === "%' OR 1=1 --";
  report.check(
    'SQL wildcard/payload disimpan sebagai teks',
    sql.status === 201 && stored,
    `${sql.status}`,
  );
  const wildcard = await client.get('/api/availability?unitId=%25&date=%25&durationMinutes=60');
  report.check('Parameter wildcard % ditolak validasi', wildcard.status === 400, codeOf(wildcard));
  const markup = await book('12:00', '<img src=x onerror=alert(1)>');
  const text = markup.json?.booking?.customerName === '<img src=x onerror=alert(1)>';
  report.check(
    'Markup disimpan apa adanya (React menampilkan sebagai teks)',
    text,
    `${markup.status}`,
  );
}

async function errorsAndInjection(report, demo) {
  await errorShape(report, demo.client);
  await injection(report, demo);
}

async function roles(report, base) {
  const customer = await visitor(base, 'customer');
  const forged = await customer.client.get('/api/owner/agenda?role=owner', {
    headers: { 'X-Role': 'owner' },
  });
  report.check('Customer ke API pemilik (role palsu) → 403', forged.status === 403, codeOf(forged));
  const anonymous = createClient(base);
  report.check(
    'Tanpa sesi → 401 pada API personal',
    (await anonymous.get('/api/bookings/mine')).status === 401,
  );
  const catalog = await anonymous.get('/api/catalog');
  report.check(
    'Katalog anonim tanpa cookie/workspace',
    catalog.status === 200 && catalog.json.source === 'sample' && anonymous.jar.size === 0,
  );
}

export async function runSecurityScenarios(report, base) {
  section('Keamanan');
  const demo = await visitor(base, 'owner');
  await originAndBody(report, demo, base);
  await runRequestErrorScenarios(report, base);
  await headers(report, base);
  await errorsAndInjection(report, demo);
  await roles(report, base);
}
