import { formatDateKey, formatTimeRange } from '../../lib/booking-format.js';
import { RowButton } from './RowButton.jsx';

function BlockSummary({ block }) {
  const when = `${formatDateKey(block.date)}, ${formatTimeRange(block.startTime, block.endTime)}`;
  return (
    <>
      <div>
        <strong>{block.unitName}</strong>
        <span className="unit-meta">{when}</span>
      </div>
      <div className="unit-state">
        <span className="status-badge status-badge--blocked">Diblokir</span>
        <small>{`${block.note || 'Tanpa catatan'}${block.isSample ? ' · Data contoh' : ''}`}</small>
      </div>
    </>
  );
}

export function BlockList({ blocks, onDelete }) {
  if (blocks.length === 0) {
    return <p className="list-state">Belum ada blok jadwal yang akan datang.</p>;
  }
  return (
    <ul className="unit-rows" aria-label="Blok jadwal yang akan datang">
      {blocks.map((block) => (
        <li key={block.id} className="unit-row">
          <BlockSummary block={block} />
          <div className="row-actions">
            <RowButton
              label="Hapus"
              target={`blok ${block.unitName} ${block.date} ${block.startTime}`}
              onClick={() => onDelete(block)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
