import { gzipSync } from 'node:zlib';
import { createClient } from './http.js';
import { codeOf } from './demo.js';

async function malformedHeaders(report, client) {
  const marker = 'PRIVATE-VERIFY';
  const cases = [
    [{ 'Content-Type': `application/json; charset=${marker}` }, 415, 'UNSUPPORTED_CHARSET'],
    [{ 'Content-Encoding': marker }, 415, 'UNSUPPORTED_ENCODING'],
    [{ 'Content-Encoding': 'gzip' }, 400, 'INVALID_BODY'],
  ];
  for (const [headers, status, code] of cases) {
    const result = await client.post('/api/demo/sessions', '{"role":"customer"}', { headers });
    report.check(
      `Format body rusak → ${code}`,
      result.status === status && codeOf(result) === code,
    );
  }
  const path = await client.get(`/api/bookings/${marker}-%ZZ`);
  report.check(
    'Encoding URL rusak → 400 INVALID_URL',
    path.status === 400 && codeOf(path) === 'INVALID_URL' && !path.text.includes(marker),
  );
}

async function compressedLimit(report, base) {
  const body = gzipSync(JSON.stringify({ role: 'customer', extra: 'x'.repeat(110000) }));
  const response = await fetch(`${base}/api/demo/sessions`, {
    method: 'POST',
    body,
    headers: { Origin: base, 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' },
  });
  report.check('Batas 100 KB berlaku sesudah dekompresi gzip', response.status === 413);
}

async function malformedOrigins(report, client, base) {
  const values = ['null', `${base}/path`, `${base}#fragment`, 'https://user@evil.example'];
  const statuses = [];
  for (const Origin of values) {
    statuses.push(
      (
        await client.post(
          '/api/demo/sessions',
          { role: 'customer' },
          {
            headers: { Origin },
          },
        )
      ).status,
    );
  }
  const site = await client.del('/api/session', {
    origin: false,
    headers: { 'Sec-Fetch-Site': 'same-site' },
  });
  report.check(
    'Origin null/path/fragment/kredensial dan same-site tanpa Origin ditolak',
    statuses.every((status) => status === 403) && site.status === 403,
  );
}

export async function runRequestErrorScenarios(report, base) {
  const client = createClient(base);
  await malformedHeaders(report, client);
  await compressedLimit(report, base);
  await malformedOrigins(report, client, base);
}
