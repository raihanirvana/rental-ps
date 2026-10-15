import { Router } from 'express';
import { config } from '../config.js';
import { clearSessionCookie, setSessionCookie } from '../lib/session-cookie.js';
import { requireSession } from '../middleware/auth.js';
import {
  describeSession,
  endDemoSession,
  startDemoSession,
} from '../services/demo-session-service.js';
import { parseDemoSessionBody } from '../validation/session-validation.js';

// 201 saat workspace baru dibuat, 200 saat ganti peran di workspace yang sama.
function createDemoSessionHandler(database) {
  return (request, response) => {
    const { role } = parseDemoSessionBody(request.body);
    const result = startDemoSession(database, {
      role,
      currentAuth: request.auth,
      sessionProblem: request.authProblem,
      ttlMinutes: config.demoTtlMinutes,
    });
    setSessionCookie(request, response, result.token, result.auth.expiresAt);
    response.status(result.workspaceCreated ? 201 : 200).json({
      session: describeSession(result.auth),
      workspaceCreated: result.workspaceCreated,
    });
  };
}

// Aman diulang: tanpa sesi tetap 204 dan cookie dibersihkan.
function createLogoutHandler(database) {
  return (request, response) => {
    const clearCookie = !request.sessionToken || endDemoSession(database, request.sessionToken);
    if (clearCookie) {
      clearSessionCookie(request, response);
    }
    response.status(204).end();
  };
}

export function createSessionRouter(database) {
  const router = Router();
  router.post('/demo/sessions', createDemoSessionHandler(database));
  router.get('/session', requireSession, (request, response) => {
    response.json({ session: describeSession(request.auth) });
  });
  router.delete('/session', createLogoutHandler(database));
  return router;
}
