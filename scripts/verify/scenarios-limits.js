import { createClient } from './http.js';
import { codeOf } from './demo.js';
import { section } from './report.js';

// Server terpisah dengan batas kecil agar batas sesi/API/kapasitas bisa dibuktikan cepat.
export const limitEnv = { DEMO_SESSION_LIMIT: '6', API_RATE_LIMIT: '25', DEMO_MAX_WORKSPACES: '2' };

async function capacity(report, base) {
  const first = createClient(base);
  const second = createClient(base);
  const third = createClient(base);
  const statuses = [];
  for (const client of [first, second, third]) {
    statuses.push((await client.post('/api/demo/sessions', { role: 'customer' })).status);
  }
  const full = await third.post('/api/demo/sessions', { role: 'customer' });
  report.check(
    'Kapasitas 2 workspace: login ketiga 503 DEMO_CAPACITY',
    statuses.join(',') === '201,201,503' &&
      codeOf(full) === 'DEMO_CAPACITY' &&
      full.headers.get('retry-after'),
    statuses.join(','),
  );
  const switchRole = await first.post('/api/demo/sessions', { role: 'owner' });
  report.check(
    'Ganti peran tetap bisa saat penuh',
    switchRole.status === 200,
    String(switchRole.status),
  );
}

async function sessionLimit(report, base) {
  const client = createClient(base);
  const statuses = [];
  let retry;
  for (let index = 0; index < 2; index += 1) {
    const response = await client.post('/api/demo/sessions', { role: 'customer' });
    statuses.push(response.status);
    retry = Number(response.headers.get('retry-after'));
  }
  report.check(
    'Batas 6 POST sesi/IP/10 menit → 429 + Retry-After',
    statuses.at(-1) === 429 && Number.isInteger(retry) && retry >= 1 && retry <= 600,
    `percobaan 6–7: ${statuses.join(',')}`,
  );
}

async function apiLimit(report, base) {
  const client = createClient(base);
  let limited = null;
  for (let index = 0; index < 30 && !limited; index += 1) {
    const response = await client.get('/api/catalog', {
      headers: { 'X-Forwarded-For': `198.51.100.${index + 1}` },
    });
    if (response.status === 429) {
      limited = { index: index + 1, retry: response.headers.get('retry-after') };
    }
  }
  report.check(
    'Batas API per IP per menit → 429',
    Boolean(limited) && Number(limited.retry) >= 1 && Number(limited.retry) <= 60,
    limited
      ? `request ke-${limited.index} (termasuk request sebelumnya), Retry-After ${limited.retry}`
      : 'tidak tercapai',
  );
}

export async function runLimitScenarios(report, base) {
  section('Batas demo (server terpisah: sesi 6/10 menit, API 25/menit, 2 workspace)');
  await capacity(report, base);
  await sessionLimit(report, base);
  await apiLimit(report, base);
}
