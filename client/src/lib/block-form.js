const controlPattern = /\p{Cc}/u;

// Grid 30 menit dalam jam buka: mulai 10.00–22.30, selesai 10.30–23.00.
function halfHours(fromMinutes, toMinutes) {
  const times = [];
  for (let minutes = fromMinutes; minutes <= toMinutes; minutes += 30) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    times.push(`${hours}:${minutes % 60 === 0 ? '00' : '30'}`);
  }
  return times;
}

export const blockStartTimes = halfHours(600, 1350);
export const blockEndTimes = halfHours(630, 1380);

export function emptyBlockForm(units, date) {
  const unit = units.find((item) => item.isActive) ?? units[0];
  return { unitId: unit?.id ?? '', date, startTime: '10:00', endTime: '11:00', note: '' };
}

export function validateBlockForm(values, range) {
  const errors = {};
  if (!values.unitId) {
    errors.unitId = 'Pilih unit.';
  }
  if (!(values.date >= range.from && values.date <= range.to)) {
    errors.date = `Pilih tanggal ${range.from} sampai ${range.to}.`;
  }
  if (values.endTime <= values.startTime) {
    errors.endTime = 'Jam selesai harus setelah jam mulai.';
  }
  if (controlPattern.test(values.note) || values.note.trim().length > 120) {
    errors.note = 'Catatan maksimal 120 karakter.';
  }
  return errors;
}

export function blockPayload(values) {
  const { unitId, date, startTime, endTime } = values;
  const note = values.note.trim();
  return { unitId, date, startTime, endTime, ...(note ? { note } : {}) };
}
