import { Router } from 'express';
import { requireRole, requireSession } from '../middleware/auth.js';
import { resetDemo } from '../services/demo-reset-service.js';
import { getSettings, updateSettings } from '../services/settings-service.js';
import { parseResetBody, parseSettingsPatch } from '../validation/settings-validation.js';

const ownerOnly = requireRole('owner');

export function createSettingsRouter(database) {
  const router = Router();
  router.get('/settings', requireSession, (request, response) => {
    response.json(getSettings(database, request.auth));
  });
  router.patch('/settings', ownerOnly, (request, response) => {
    response.json(updateSettings(database, request.auth, parseSettingsPatch(request.body)));
  });
  router.post('/demo/reset', ownerOnly, (request, response) => {
    parseResetBody(request.body);
    response.json(resetDemo(database, request.auth));
  });
  return router;
}
