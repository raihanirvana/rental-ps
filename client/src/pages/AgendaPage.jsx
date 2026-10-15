import { AgendaControls } from '../components/agenda/AgendaControls.jsx';
import { AgendaDetailDialog } from '../components/agenda/AgendaDetailDialog.jsx';
import { AgendaList } from '../components/agenda/AgendaList.jsx';
import { AgendaSummary } from '../components/agenda/AgendaSummary.jsx';
import { AgendaTimeline } from '../components/agenda/AgendaTimeline.jsx';
import { Link } from '../components/Link.jsx';
import { ErrorNotice, RefreshErrorNotice } from '../components/Notice.jsx';
import { useAgenda } from '../hooks/useAgenda.js';
import { useAgendaDetail } from '../hooks/useAgendaDetail.js';
import { boardData, formatServerClock } from '../lib/agenda-items.js';
import { agendaItems } from '../lib/agenda-timeline.js';
import { agendaHref, readAgendaQuery } from '../lib/agenda-view.js';
import { formatDateKey } from '../lib/booking-format.js';

function AgendaLists({ items, board, onOpen }) {
  return (
    <>
      <AgendaList
        className="agenda-list--all"
        label="Agenda kronologis"
        items={items}
        unitNames={board.unitNames}
        onOpen={onOpen}
      />
      <AgendaList
        className="agenda-list--cancelled"
        label="Booking dibatalkan"
        items={board.cancelled}
        unitNames={board.unitNames}
        onOpen={onOpen}
      />
    </>
  );
}

// Desktop: timeline per unit + daftar dibatalkan. Ponsel: daftar kronologis (CSS).
function AgendaBoard({ data, filters, onOpen }) {
  const items = agendaItems(data);
  const board = boardData(data, filters, items);
  return (
    <section className="agenda-panel" aria-labelledby="agenda-title">
      <div className="agenda-toolbar">
        <h2 id="agenda-title">{formatDateKey(data.date)}</h2>
        <span className="demo-note">Waktu dalam WIB</span>
      </div>
      {items.length === 0 ? (
        <p className="agenda-empty">Tidak ada booking atau blok pada tanggal ini.</p>
      ) : (
        <AgendaTimeline units={board.units} items={items} onOpen={onOpen} />
      )}
      <AgendaLists items={items} board={board} onOpen={onOpen} />
      <p className="agenda-footer">
        Jam buka penuh 10.00–23.00 WIB. Waktu server saat dimuat:{' '}
        {formatServerClock(data.serverTime)}.
      </p>
    </section>
  );
}

function AgendaError({ agenda, filters }) {
  if (agenda.error.code !== 'UNIT_NOT_FOUND') {
    return <ErrorNotice error={agenda.error} onRetry={agenda.retry} />;
  }
  return (
    <p className="list-state">
      Unit di filter tidak ditemukan.{' '}
      <Link className="text-link" to={agendaHref({ ...filters, unitId: null })}>
        Tampilkan semua unit
      </Link>
    </p>
  );
}

function AgendaContent({ agenda, filters }) {
  const data = agenda.data;
  const detail = useAgendaDetail(agenda);
  const unitNames = new Map(data.units.map((unit) => [unit.id, unit.name]));
  return (
    <>
      <AgendaControls filters={filters} date={data.date} units={data.units} />
      <AgendaSummary summary={data.summary} />
      <AgendaBoard data={data} filters={filters} onOpen={detail.open} />
      <AgendaDetailDialog detail={detail} agenda={agenda} unitNames={unitNames} />
    </>
  );
}

export function AgendaPage({ searchParams }) {
  const filters = readAgendaQuery(searchParams);
  const agenda = useAgenda(filters);
  return (
    <>
      <div className="page-intro owner-intro">
        <h1>Semua sesi, satu agenda.</h1>
        <p>Lihat siapa yang main, unit yang masih kosong dan jam yang diblokir.</p>
      </div>
      <div aria-busy={agenda.status === 'loading'}>
        <RefreshErrorNotice resource={agenda} />
        {agenda.status === 'error' ? <AgendaError agenda={agenda} filters={filters} /> : null}
        {agenda.status === 'loading' ? <p className="list-state">Memuat agenda…</p> : null}
        {agenda.status === 'ready' ? (
          <AgendaContent key={agenda.key} agenda={agenda} filters={filters} />
        ) : null}
      </div>
    </>
  );
}
