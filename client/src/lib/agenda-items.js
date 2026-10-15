import { agendaStateLabels } from './agenda-view.js';
import { formatClock } from './format.js';

export function itemTitle(item) {
  return item.kind === 'block' ? item.note || 'Blok jadwal' : item.customerName;
}

export function itemState(item) {
  return item.kind === 'block' ? 'blocked' : item.timeState;
}

export function itemInterval(item) {
  return `${formatClock(item.startTime)}–${formatClock(item.endTime)}`;
}

// Nama yang dibacakan: siapa/apa, jam, status dan penanda data contoh.
export function itemLabel(item, unitName) {
  const sample = item.isSample ? ', data contoh' : '';
  const state = agendaStateLabels[itemState(item)];
  return `${unitName}, ${itemTitle(item)}, ${itemInterval(item)} WIB, ${state}${sample}`;
}

// Data papan agenda: item gabungan, lane unit sesuai filter dan nama unit untuk label.
export function boardData(data, filters, items) {
  return {
    units: filters.unitId ? data.units.filter((unit) => unit.id === filters.unitId) : data.units,
    unitNames: new Map(data.units.map((unit) => [unit.id, unit.name])),
    cancelled: items.filter((item) => item.status === 'cancelled'),
  };
}

const serverClock = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function formatServerClock(iso) {
  return `${serverClock.format(new Date(iso))} WIB`;
}
