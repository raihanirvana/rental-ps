import { listOwnerBlocks, listOwnerUnits } from '../lib/owner-api.js';
import { useRefreshableResource } from './useRefreshableResource.js';

// Request stabil di level modul: key tetap, hanya refresh/retry yang memuat ulang.
const unitsRequest = (signal) => listOwnerUnits(signal);
const blocksRequest = (signal) => listOwnerBlocks(signal);

export function useOwnerUnits() {
  return useRefreshableResource('owner-units', unitsRequest);
}

export function useOwnerBlocks() {
  return useRefreshableResource('owner-blocks', blocksRequest);
}
