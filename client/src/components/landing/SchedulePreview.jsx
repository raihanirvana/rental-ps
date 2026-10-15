// Papan jadwal ilustrasi (DESIGN.md §5). Data tetap untuk gambaran, bukan ketersediaan
// nyata; ketersediaan asli hanya dari GET /api/availability setelah masuk demo.
const lanes = [
  { unit: 'PS4 A', cells: [['Terisi', 'booked'], ['Kosong'], ['Diblokir', 'blocked', 2]] },
  { unit: 'PS4 B', cells: [['Terisi', 'booked'], ['Kosong'], ['Kosong'], ['Kosong']] },
  {
    unit: 'PS5 A',
    cells: [['Terisi', 'booked'], ['Pilihanmu · 19.00–21.00', 'picked', 2], ['Kosong']],
  },
  { unit: 'PS5 B', cells: [['Kosong'], ['Kosong'], ['Terisi', 'booked', 2]] },
];

function cellClass(kind, span) {
  const classes = ['mini-cell'];
  if (kind) {
    classes.push(`mini-cell--${kind}`);
  }
  if (span === 2) {
    classes.push('mini-cell--span-2');
  }
  return classes.join(' ');
}

function Lane({ unit, cells }) {
  return (
    <li className="mini-lane">
      <span className="mini-unit">{unit}</span>
      <span className="mini-track">
        {cells.map(([label, kind, span], index) => (
          <span key={index} className={cellClass(kind, span)}>
            {label}
          </span>
        ))}
      </span>
    </li>
  );
}

function PreviewHeader() {
  return (
    <>
      <div className="schedule-top">
        <div>
          <h2 id="preview-title">Jam kosong, sekali lihat.</h2>
          <p>Ilustrasi papan jadwal empat unit, 18.00–22.00</p>
        </div>
        <span className="pill pill--neutral">WIB</span>
      </div>
      <div className="time-labels" aria-hidden="true">
        <span />
        {['18.00', '19.00', '20.00', '21.00'].map((time) => (
          <span key={time}>{time}</span>
        ))}
      </div>
    </>
  );
}

export function SchedulePreview() {
  return (
    <figure className="schedule-frame" aria-labelledby="preview-title">
      <PreviewHeader />
      <ul className="mini-lanes">
        {lanes.map((lane) => (
          <Lane key={lane.unit} {...lane} />
        ))}
      </ul>
      <PreviewFooter />
    </figure>
  );
}

function PreviewFooter() {
  return (
    <figcaption className="mini-footer">
      <div>
        <strong>Contoh: PS5 A, dua jam main</strong>
        <span>Rp50.000 · bayar di tempat</span>
      </div>
      <span className="demo-note">Ilustrasi, bukan slot tersedia</span>
    </figcaption>
  );
}
