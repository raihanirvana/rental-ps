// Aturan jadwal PRD §5 dan §8. Jam buka tetap untuk MVP; tidak diambil dari client.
export const scheduleRules = Object.freeze({
  timeZone: 'Asia/Jakarta',
  timeZoneLabel: 'WIB',
  openTime: '10:00',
  closeTime: '23:00',
  slotStepMinutes: 30,
  durationsMinutes: Object.freeze([60, 120, 180]),
  leadMinutes: 15,
  horizonDays: 14,
});
