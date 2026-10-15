import { Router } from 'express';

// Publik dan tanpa data rahasia: tidak menampilkan path database atau pesan error mentah.
function checkDatabase(database) {
  try {
    database.prepare('SELECT 1 AS ready').get();
    return true;
  } catch {
    return false;
  }
}

export function createHealthRouter(database) {
  const router = Router();
  router.get('/health', (_request, response) => {
    const ready = checkDatabase(database);
    response.status(ready ? 200 : 503).json({
      status: ready ? 'ok' : 'degraded',
      service: 'sesi-play-api',
      database: ready ? 'connected' : 'unavailable',
      timestamp: new Date().toISOString(),
    });
  });
  return router;
}
