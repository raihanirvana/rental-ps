import { createTempDirectory, removeTempDirectory, startServer } from './verify/harness.js';
import { cloneClient } from './verify/http.js';
import { createReport, section } from './verify/report.js';
import { runBookingScenarios } from './verify/scenarios-booking.js';
import { runCapacityScenarios } from './verify/scenarios-capacity.js';
import { runIsolationScenarios } from './verify/scenarios-isolation.js';
import { runLifecycleScenarios } from './verify/scenarios-lifecycle.js';
import { limitEnv, runLimitScenarios } from './verify/scenarios-limits.js';
import { runProxyScenarios } from './verify/scenarios-proxy.js';
import { runRaceScenarios } from './verify/scenarios-race.js';
import { runRollbackScenario } from './verify/scenarios-rollback.js';
import { runSecurityScenarios } from './verify/scenarios-security.js';

// Verifikasi integrasi API yang bisa diulang (bukan unit test): server proyek asli, SQLite dan
// port sementara, tanpa tanggal hardcoded. Hanya proses milik skrip ini yang dihentikan.
async function persistence(report, temp, first, servers) {
  section('Restart server');
  const previous = servers.a;
  await previous.stop();
  servers.a = await startServer({ databasePath: temp.databasePath });
  servers.a.logs.unshift(...previous.logs);
  first.demo.client = cloneClient(first.demo.client, servers.a.url);
  const mine = await first.demo.client.get('/api/bookings/mine');
  report.check(
    'Cookie lama tetap berlaku dan booking ada setelah restart',
    mine.status === 200 && mine.json.total > 0,
    `total ${mine.json?.total}`,
  );
}

// Data hosting hilang: cookie lama ke server dengan database baru → 401, tanpa data siapa pun.
async function lostData(report, first) {
  const fresh = createTempDirectory();
  const server = await startServer({ databasePath: fresh.databasePath });
  try {
    const client = cloneClient(first.demo.client, server.url);
    const session = await client.get('/api/session');
    const mine = await client.get('/api/bookings/mine');
    const ok = session.status === 401 && mine.status === 401;
    report.check(
      'Database hosting hilang: cookie lama → 401, tanpa data',
      ok,
      `${session.status}/${mine.status}`,
    );
  } finally {
    await server.stop();
    removeTempDirectory(fresh.directory);
  }
}

async function runLimits(report) {
  const limits = createTempDirectory();
  const limited = await startServer({ databasePath: limits.databasePath, env: limitEnv });
  try {
    await runLimitScenarios(report, limited.url);
  } finally {
    await limited.stop();
    removeTempDirectory(limits.directory);
  }
}

async function runProxy(report, plainBase) {
  const proxy = createTempDirectory();
  const env = { TRUST_PROXY: 'loopback', API_RATE_LIMIT: '3' };
  const trusted = await startServer({ databasePath: proxy.databasePath, env });
  try {
    await runProxyScenarios(report, trusted.url, plainBase);
  } finally {
    await trusted.stop();
    removeTempDirectory(proxy.directory);
  }
}

async function runAll(report, temp, servers) {
  const first = await runBookingScenarios(report, servers.a.url);
  await runLifecycleScenarios(report, servers.a.url, temp.databasePath, first.booking, first.demo);
  await runSecurityScenarios(report, servers.a.url);
  await runRollbackScenario(report, servers.a.url, temp.databasePath);
  await runRaceScenarios(report, servers.a.url, servers.b.url, temp.databasePath);
  await persistence(report, temp, first, servers);
  await lostData(report, first);
  await runIsolationScenarios(report, servers.a.url, temp.databasePath, first);
  await runProxy(report, servers.a.url);
  await runLimits(report);
  await runCapacityScenarios(report);
}

// Log server tidak boleh memuat nama pelanggan, nomor HP, token/cookie atau stack trace.
function checkLogs(report, servers) {
  const logs = [...servers.a.logs, ...servers.b.logs].join('');
  const leaks = ['Uji Verifikasi', "%' OR 1=1", 'sesi_play_session=', '    at ', 'PRIVATE-VERIFY'];
  const found = leaks.filter((needle) => logs.includes(needle));
  report.check('Log server tanpa PII/token/stack trace', found.length === 0, found.join(', '));
}

async function main() {
  const report = createReport();
  const temp = createTempDirectory();
  const servers = {};
  try {
    servers.a = await startServer({ databasePath: temp.databasePath });
    servers.b = await startServer({ databasePath: temp.databasePath });
    await runAll(report, temp, servers);
    checkLogs(report, servers);
  } catch (error) {
    report.check('Skrip verifikasi berjalan sampai selesai', false, error.stack);
  } finally {
    await Promise.all(Object.values(servers).map((server) => server.stop()));
    removeTempDirectory(temp.directory);
  }
  process.exitCode = report.summary() ? 0 : 1;
}

await main();
