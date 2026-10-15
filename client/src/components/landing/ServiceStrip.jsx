import { formatClock } from '../../lib/format.js';
import { CheckIcon, ClockIcon, ControllerIcon, TvIcon } from '../icons.jsx';

// Jam buka dari aturan server; fasilitas adalah identitas contoh yang sama di setiap unit.
export function ServiceStrip({ rules }) {
  const hours = rules
    ? `${formatClock(rules.openTime)}–${formatClock(rules.closeTime)} WIB`
    : 'Jam buka WIB';
  return (
    <ul className="service-strip" aria-label="Fasilitas contoh">
      <li>
        <ClockIcon />
        {hours}
      </li>
      <li>
        <ControllerIcon />
        Dua kontroler per unit
      </li>
      <li>
        <TvIcon />
        TV untuk setiap unit
      </li>
      <li>
        <CheckIcon />
        Bayar di tempat
      </li>
    </ul>
  );
}
