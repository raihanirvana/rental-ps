import { createTempDirectory, removeTempDirectory, startServer } from './harness.js';
import { withDatabase } from './fixtures.js';
import { createClient } from './http.js';
import { section } from './report.js';

const env = { DEMO_MAX_WORKSPACES: '2', ALLOWED_ORIGINS: 'https://preview.example:443' };

async function allowlistedClient(report, base) {
  const body = { role: 'customer' };
  const client = createClient(base);
  const allowed = await client.post('/api/demo/sessions', body, {
    headers: { Origin: 'https://preview.example' },
  });
  const foreign = await client.post('/api/demo/sessions', body, {
    headers: { Origin: 'https://foreign.example' },
  });
  report.check(
    'Allowlist origin dinormalisasi; origin lain tetap 403 tanpa CORS',
    allowed.status === 201 &&
      foreign.status === 403 &&
      !allowed.headers.has('access-control-allow-origin'),
  );
  return client;
}

async function capacityRace(report, first, second, databasePath) {
  const client = await allowlistedClient(report, first.url);
  const body = { role: 'customer' };
  const results = await Promise.all(
    [first, second].map((server) => createClient(server.url).post('/api/demo/sessions', body)),
  );
  const count = withDatabase(
    databasePath,
    (db) => db.prepare('SELECT count(*) n FROM workspaces').get().n,
  );
  report.check(
    'Dua login berebut satu kapasitas terakhir antarproses: 201+503, total 2',
    results
      .map((result) => result.status)
      .sort()
      .join('+') === '201+503' && count === 2,
  );
  await expiredSlot(report, client, first.url, databasePath);
}

async function expiredSlot(report, client, base, databasePath) {
  const unit = (await client.get('/api/catalog')).json.units[0].id;
  const expired = new Date(Date.now() - 60000).toISOString();
  const created = new Date(Date.now() - 3600000).toISOString();
  const id = withDatabase(databasePath, (db) => {
    const { workspace_id: workspaceId } = db
      .prepare('SELECT workspace_id FROM units WHERE id = ?')
      .get(unit);
    db.prepare('UPDATE workspaces SET created_at = ?, expires_at = ? WHERE id = ?').run(
      created,
      expired,
      workspaceId,
    );
    return workspaceId;
  });
  const response = await createClient(base).post('/api/demo/sessions', { role: 'customer' });
  const removed = withDatabase(
    databasePath,
    (db) => !db.prepare('SELECT id FROM workspaces WHERE id = ?').get(id),
  );
  report.check(
    'Workspace expired dibersihkan sehingga kapasitas bisa dipakai lagi',
    response.status === 201 && removed,
  );
}

export async function runCapacityScenarios(report) {
  section('Kapasitas atomik dan allowlist origin');
  const temp = createTempDirectory();
  const servers = [];
  try {
    servers.push(await startServer({ databasePath: temp.databasePath, env }));
    servers.push(await startServer({ databasePath: temp.databasePath, env }));
    await capacityRace(report, servers[0], servers[1], temp.databasePath);
  } finally {
    await Promise.all(servers.map((server) => server.stop()));
    removeTempDirectory(temp.directory);
  }
}
