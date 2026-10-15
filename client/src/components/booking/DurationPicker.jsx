import { formatDuration } from '../../lib/booking-format.js';

export function DurationPicker({ durations, value, onChange }) {
  return (
    <fieldset className="fieldset">
      <legend>Durasi main</legend>
      <div className="duration-picker">
        {durations.map((minutes) => (
          <label key={minutes} className="choice">
            <input
              type="radio"
              name="duration"
              value={minutes}
              checked={minutes === value}
              onChange={() => onChange(minutes)}
            />
            <span className="duration-choice">{formatDuration(minutes)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
