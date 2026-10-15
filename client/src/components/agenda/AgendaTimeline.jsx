import { gridColumn, timelineHours } from '../../lib/agenda-timeline.js';
import { formatRupiah } from '../../lib/format.js';
import { itemLabel, itemState } from '../../lib/agenda-items.js';
import { AgendaItemContent } from './AgendaItemContent.jsx';

function TimelineItem({ item, unit, onOpen }) {
  return (
    <button
      type="button"
      className={`reservation reservation--${itemState(item)}`}
      style={{ gridColumn: gridColumn(item.startTime, item.endTime) }}
      aria-label={itemLabel(item, unit.name)}
      onClick={() => onOpen({ kind: item.kind, id: item.id })}
    >
      <AgendaItemContent item={item} />
    </button>
  );
}

function TimelineRow({ unit, items, onOpen }) {
  return (
    <div className="timeline-row" role="listitem">
      <div className="timeline-unit">
        <strong>{unit.name}</strong>
        <small>{`${formatRupiah(unit.hourlyRate)} / jam`}</small>
      </div>
      <div className="timeline-track">
        {items.map((item) => (
          <TimelineItem key={item.key} item={item} unit={unit} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

function TimelineHours() {
  return (
    <div className="timeline-hours" aria-hidden="true">
      <span>Unit</span>
      {timelineHours.map((hour) => (
        <span key={hour}>{hour}</span>
      ))}
    </div>
  );
}

// Booking dibatalkan tidak digambar di timeline (ditampilkan di daftar terpisah).
export function AgendaTimeline({ units, items, onOpen }) {
  const visible = items.filter((item) => item.kind === 'block' || item.status !== 'cancelled');
  return (
    <div
      className="timeline-scroll"
      tabIndex={0}
      role="region"
      aria-label="Timeline 10.00–23.00 WIB"
    >
      <div className="timeline" role="list">
        <TimelineHours />
        {units.map((unit) => (
          <TimelineRow
            key={unit.id}
            unit={unit}
            items={visible.filter((item) => item.unitId === unit.id)}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}
