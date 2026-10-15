import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from './config.js';
import { loadSession } from './middleware/auth.js';
import { apiNotFound, errorHandler } from './middleware/errors.js';
import { requestContext } from './middleware/request-context.js';
import { createHealthRouter } from './routes/health.js';
import { createSessionRouter } from './routes/session.js';

// Respons API berisi data sesi/workspace, jadi tidak boleh disimpan cache.
function noStore(_request, response, next) {
  response.set('Cache-Control', 'no-store');
  next();
}

function mountApi(app, database) {
  app.use('/api', noStore);
  app.use('/api', express.json({ limit: '100kb' }));
  app.use('/api', createHealthRouter(database));
  app.use('/api', loadSession(database));
  app.use('/api', createSessionRouter(database));
  app.use('/api', apiNotFound);
}

// Build Vite disajikan langsung; path frontend lain jatuh ke index.html agar bisa di-refresh.
function mountFrontend(app) {
  const indexFile = resolve(config.webDirectory, 'index.html');
  if (!existsSync(indexFile)) {
    console.warn('Build frontend belum ada; jalankan `npm run build` untuk menyajikan UI.');
    return;
  }
  app.use(express.static(config.webDirectory, { dotfiles: 'deny', index: false }));
  app.get('/{*path}', (_request, response) => {
    response.set('Cache-Control', 'no-cache');
    response.sendFile(indexFile);
  });
}

export function createApp(database) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(requestContext);
  mountApi(app, database);
  mountFrontend(app);
  app.use(errorHandler);
  return app;
}
