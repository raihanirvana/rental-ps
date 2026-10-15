import { itemInterval, itemState, itemTitle } from '../../lib/agenda-items.js';
import { agendaStateLabels } from '../../lib/agenda-view.js';

export function AgendaItemContent({ item }) {
  return (
    <>
      <strong>{itemTitle(item)}</strong>
      <span>{`${itemInterval(item)} · ${agendaStateLabels[itemState(item)]}`}</span>
      {item.isSample ? <span>Data contoh</span> : null}
    </>
  );
}
