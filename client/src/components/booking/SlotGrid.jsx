import { slotReasonLabels } from '../../lib/booking-format.js';
import { formatClock } from '../../lib/format.js';

function SlotButton({ slot, pressed, onPick }) {
  const reason = slot.available ? null : slotReasonLabels[slot.reason];
  const className = slot.reason === 'blocked' ? 'slot slot--blocked' : 'slot';
  return (
    <button
      type="button"
      className={className}
      disabled={!slot.available}
      aria-pressed={slot.available ? pressed : undefined}
      aria-label={`${formatClock(slot.startTime)}, ${reason ?? 'tersedia'}`}
      onClick={() => onPick(slot.startTime)}
    >
      {formatClock(slot.startTime)}
      {reason ? <small>{reason}</small> : null}
    </button>
  );
}

export function SlotGrid({ slots, selected, onPick }) {
  return (
    <div className="slot-grid" role="group" aria-label="Jam mulai">
      {slots.map((slot) => (
        <SlotButton
          key={slot.startTime}
          slot={slot}
          pressed={slot.startTime === selected}
          onPick={onPick}
        />
      ))}
    </div>
  );
}

export function SlotLegend() {
  return (
    <div className="legend" aria-hidden="true">
      <span>
        <i />
        Tersedia
      </span>
      <span>
        <i className="legend--chosen" />
        Dipilih
      </span>
      <span>
        <i className="legend--busy" />
        Terisi / lewat
      </span>
      <span>
        <i className="legend--blocked" />
        Diblokir
      </span>
    </div>
  );
}
