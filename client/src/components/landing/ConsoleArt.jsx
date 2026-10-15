// Diagram garis kecil sebagai pembeda setup, bukan gambar produk resmi.
const paths = {
  PS4: [
    'm16 21 45-9 8 52-45 10-8-53Z',
    'm20 47 45-9m-43 7 2 29 7 12 42-10-4-12M31 86l-7-12m23-53 4 25',
    'm32 69 20-4',
  ],
  PS5: [
    'm26 9 14 7 14-7 6 76-20 5-20-5 6-76Z',
    'M40 16v74m14-81-7 31 5 48M26 9l7 31-5 47',
    'M52 67v9',
  ],
};

export function ConsoleArt({ kind }) {
  return (
    <svg
      className="console-art"
      viewBox="0 0 80 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {paths[kind].map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  );
}
