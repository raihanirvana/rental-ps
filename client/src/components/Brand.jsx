import { PlayMark } from './icons.jsx';
import { Link } from './Link.jsx';

// Logo teks milik demo; bukan logo PlayStation resmi.
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Sesi Play, beranda">
      <span className="brand-mark">
        <PlayMark />
      </span>
      sesi play
    </Link>
  );
}
