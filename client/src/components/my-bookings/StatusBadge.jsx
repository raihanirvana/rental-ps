import { timeStateLabels } from '../../lib/my-bookings-view.js';

// Status selalu tertulis; warna hanya penguat.
export function StatusBadge({ timeState }) {
  return (
    <span className={`status-badge status-badge--${timeState}`}>{timeStateLabels[timeState]}</span>
  );
}
