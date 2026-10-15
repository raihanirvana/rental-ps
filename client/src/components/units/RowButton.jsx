// Tombol baris dengan teks tersembunyi agar pembaca layar tahu objeknya.
export function RowButton({ label, target, onClick, disabled, quiet = true }) {
  const className = `button ${quiet ? 'button--quiet' : 'button--white'} button--small`;
  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled}>
      {label}
      <span className="visually-hidden"> {target}</span>
    </button>
  );
}
