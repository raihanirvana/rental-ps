import { blockEndTimes, blockStartTimes } from './block-form.js';
import { formatClock } from './format.js';

const toOptions = (times) =>
  times.map((time) => ({ value: time, label: `${formatClock(time)} WIB` }));

export const startOptions = toOptions(blockStartTimes);
export const endOptions = toOptions(blockEndTimes);

export function unitOptions(units) {
  return units.map((unit) => ({
    value: unit.id,
    label: unit.isActive ? unit.name : `${unit.name} (nonaktif)`,
  }));
}

// Props bersama untuk field form blok: id, nilai, error dan handler perubahan.
export function blockFieldProps(form, name) {
  return {
    id: `block-${name}`,
    value: form.values[name],
    error: form.fieldErrors[name],
    disabled: form.busy,
  };
}
