import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from './config.js';
import { loadSession } from './middleware/auth.js';
import { apiNotFound, errorHandler } from './middleware/errors.js';
import { requireJsonBody } from './middleware/json-only.js';
import { requireSameOrigin } from './middleware/origin-check.js';
import { createRateLimiter } from './middleware/rate-limit.js';
import { requestContext } from './middleware/request-context.js';
import { securityHeaders } from './middleware/security-headers.js';
import { createBookingRouter } from './routes/bookings.js';
import { createCatalogRouter } from './routes/catalog.js';
import { createHealthRouter } from './routes/health.js';
import { createOwnerRouter } from './routes/owner.js';
import { createSettingsRouter } from './routes/settings.js';
import { createSessionRouter } from './routes/session.js';

// Respons API berisi data sesi/workspace, jadi tidak boleh disimpan cache.
function noStore(_request, response, next) {
  response.set('Cache-Control', 'no-store');
  next();
}

function createLimiters() {
  return {
    sessions: createRateLimiter({
      windowMs: 10 * 60 * 1000,
      max: config.demoSessionLimit,
      message: 'Terlalu banyak percobaan masuk demo. Coba lagi beberapa menit lagi.',
    }),
    api: createRateLimiter({
      windowMs: 60 * 1000,
      max: config.apiRateLimit,
      message: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.',
    }),
  };
}

// Urutan: no-store & batas per IP, origin, JSON wajib, parsing ≤100 KB, sesi, router.
function mountApiGuards(app) {
  const limiters = createLimiters();
  app.use('/api', noStore);
  app.use('/api', limiters.api);
  app.use('/api', requireSameOrigin);
  app.use('/api', requireJsonBody);
  app.post('/api/demo/sessions', limiters.sessions);
  app.use('/api', express.json({ limit: '100kb' }));
}

function mountApi(app, database) {
  mountApiGuards(app);
  app.use('/api', createHealthRouter(database));
  app.use('/api', loadSession(database));
  app.use('/api', createSessionRouter(database));
  app.use('/api', createCatalogRouter(database));
  app.use('/api', createBookingRouter(database));
  app.use('/api', createOwnerRouter(database));
  app.use('/api', createSettingsRouter(database));
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
  // Middleware tanpa parameter rute: path dengan encoding rusak (mis. %ZZ) tetap mendapat
  // index.html dan halaman 404 React, bukan error decode 500.
  app.use((request, response, next) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      next();
      return;
    }
    response.set('Cache-Control', 'no-cache');
    response.sendFile(indexFile);
  });
}

export function createApp(database) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(requestContext);
  app.use(securityHeaders);
  mountApi(app, database);
  mountFrontend(app);
  app.use(errorHandler);
  return app;
}
