import { agendaStateLabels } from '../../lib/agenda-view.js';
import { itemInterval, itemLabel, itemState, itemTitle } from '../../lib/agenda-items.js';

function AgendaListItem({ item, unitName, onOpen }) {
  const state = itemState(item);
  return (
    <li className="mobile-booking">
      <div className="mobile-booking-header">
        <strong>{`${unitName} · ${itemTitle(item)}`}</strong>
        <span className={`status-badge status-badge--${state}`}>{agendaStateLabels[state]}</span>
      </div>
      <p>{`${itemInterval(item)} WIB${item.isSample ? ' · Data contoh' : ''}`}</p>
      <button
        type="button"
        className="text-link"
        aria-label={`Lihat detail: ${itemLabel(item, unitName)}`}
        onClick={() => onOpen({ kind: item.kind, id: item.id })}
      >
        Lihat detail
      </button>
    </li>
  );
}

// Daftar kronologis: seluruh agenda di ponsel, atau hanya booking dibatalkan di desktop.
export function AgendaList({ items, unitNames, onOpen, className, label }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <ul className={`agenda-list ${className}`} aria-label={label} data-title={label}>
      {items.map((item) => (
        <AgendaListItem
          key={item.key}
          item={item}
          unitName={unitNames.get(item.unitId) ?? item.unitName}
          onOpen={onOpen}
        />
      ))}
    </ul>
  );
}
