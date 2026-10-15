import { apiRequest } from './api.js';

export function listOwnerUnits(signal) {
  return apiRequest('/owner/units', { signal });
}

export function createUnit(payload) {
  return apiRequest('/owner/units', { method: 'POST', body: payload });
}

export function updateUnit(id, payload) {
  return apiRequest(`/owner/units/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload });
}

export function listOwnerBlocks(signal) {
  return apiRequest('/owner/blocks', { signal });
}

export function createBlock(payload) {
  return apiRequest('/owner/blocks', { method: 'POST', body: payload });
}

export function deleteBlock(id) {
  return apiRequest(`/owner/blocks/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
